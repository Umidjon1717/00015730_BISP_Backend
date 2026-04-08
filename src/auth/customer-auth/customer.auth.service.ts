import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../customer/entities/customer.entity';
import { Request, Response } from 'express';
import { CreateCustomerDto } from '../../customer/dto/create-customer.dto';
import { CustomerService } from '../../customer/customer.service';
import { createApiResponse } from '../../common/utils';
import { CustomerSignInDto } from '../dto/customer-signin.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { MailService } from '../../mail/mail.service';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@Injectable()
export class CustomerAuthService {
  constructor(
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    private readonly customerService: CustomerService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async customerGenerateTokens(customer: Customer) {
    const payload = {
      id: customer.id,
      email: customer.email,
      first_name: customer.first_name,
      is_active: customer.is_active,
    };
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.sign(payload, {
        secret: process.env.ACCESS_TOKEN_KEY,
        expiresIn: process.env.ACCESS_TOKEN_TIME,
      }),
      this.jwtService.sign(payload, {
        secret: process.env.REFRESH_TOKEN_KEY,
        expiresIn: process.env.REFRESH_TOKEN_TIME,
      }),
    ]);
    return { access_token, refresh_token };
  }

  async updateRefreshToken(customerId: number, refresh_token: string) {
    const hashed_refresh_token = await hash(refresh_token, 7);
    await this.customerRepo.update(
      { id: customerId },
      { hashed_refresh_token },
    );
  }

  async checkToken(token: string) {
    try {
      const decodedData = await this.jwtService.verify(token, {
        secret: process.env.ACCESS_TOKEN_KEY,
      });
      if (!decodedData) {
        throw new UnauthorizedException('Token invalid or expired');
      }

      const response = await this.customerRepo.findOneBy({
        email: decodedData.email,
      });
      if (!response) {
        throw new UnauthorizedException('Customer not found');
      }
      const customer = {
        id: response.id,
        first_name: response.first_name,
        last_name: response.last_name,
        is_active: response.is_active,
        phone_number: response.phone_number,
        email: response.email,
      };

      return { message: 'Token is valid', statusCode: 200, customer };
    } catch (error) {
      throw new UnauthorizedException('Token invalid or expired');
    }
  }
  async signUp(res: Response, createCustomerDto: CreateCustomerDto) {
    const customer = await this.customerService.create(createCustomerDto);
    if (!customer) {
      throw new BadRequestException('Failed to create customer');
    }

    const newCustomer = await this.customerRepo.findOneBy({ id: customer.id });
    return createApiResponse(201, 'Customer signed up successfully', {
      newCustomer,
    });
  }

  async signIn(res: Response, customerSignInDto: CustomerSignInDto) {
    const { email, password } = customerSignInDto;

    const customer = await this.customerRepo.findOneBy({ email });
    if (!customer) {
      throw new UnauthorizedException('Incorrect email or password');
    }
    const validPassword = await compare(password, customer.hashed_password);
    if (!validPassword) {
      throw new UnauthorizedException('Incorrect email or password');
    }
    const { access_token, refresh_token } =
      await this.customerGenerateTokens(customer);

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: +process.env.COOKIE_TIME,
    });

    const response = {
      id: customer.id,
      access_token,
      is_active: customer.is_active,
    };
    await this.updateRefreshToken(customer.id, refresh_token);
    return createApiResponse(200, 'Customer signed in successfully', response);
  }

  async handleRefreshToken(res: Response, req: Request) {
    const { id, refresh_token } = req['user'];

    const customer = await this.customerRepo.findOne({ where: { id: +id } });
    if (!customer || !customer.hashed_refresh_token) {
      throw new BadRequestException('Customer not found or invalid token');
    }

    const tokenMatches = await compare(
      refresh_token,
      customer.hashed_refresh_token,
    );
    if (!tokenMatches) {
      throw new ForbiddenException('Access denied');
    }

    const decodedToken = this.jwtService.decode(refresh_token);
    if (!decodedToken) {
      throw new UnauthorizedException('Token is invalid or expired');
    }

    const { access_token, refresh_token: newRefreshToken } =
      await this.customerGenerateTokens(customer);
    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      maxAge: +process.env.COOKIE_TIME,
    });

    const response = {
      id: customer.id,
      access_token,
    };

    await this.updateRefreshToken(customer.id, newRefreshToken);
    return createApiResponse(200, 'Token refreshed successfully', response);
  }

  async signOut(res: Response, req: Request) {
    const { id, refresh_token } = req['user'];

    if (!id || !refresh_token) {
      throw new UnauthorizedException('Invalid request data');
    }

    const result = await this.customerRepo.update(+id, {
      hashed_refresh_token: null,
    });
    if (result.affected === 0) {
      throw new NotFoundException('Customer not found');
    }

    res.clearCookie('refresh_token');
    return createApiResponse(200, 'Customer signed out successfully', { id });
  }

  async forgotPassword(email: string) {
    try {
      const customer = await this.customerRepo.findOneBy({ email });
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      const payload = { email: customer.email, id: customer.id };
      const token = this.jwtService.sign(payload, {
        secret: process.env.RESET_PASSWORD_SECRET,
        expiresIn: '1h',
      });

      await this.cacheManager.set(
        `reset-password-${customer.id}`,
        token,
        3600000,
      );

      return {
        message: 'Password ready to change',
      };
    } catch (error) {
      console.error('Error during forgot password process:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Error occurred while sending reset link to the email for password reset',
      );
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { confirm_password, email, password } = resetPasswordDto;

    if (confirm_password !== password) {
      throw new BadRequestException(
        'Passwords do not match. Please check both fields',
      );
    }

    const customer = await this.customerRepo.findOneBy({ email });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const cachedToken: string = await this.cacheManager.get(
      `reset-password-${customer.id}`,
    );
    if (!cachedToken) {
      throw new BadRequestException('Password reset link expired or invalid');
    }

    let decodedToken: any;
    try {
      decodedToken = this.jwtService.verify(cachedToken, {
        secret: process.env.RESET_PASSWORD_SECRET,
      });
    } catch (error) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (decodedToken.email !== email) {
      throw new BadRequestException('Email mismatch');
    }

    const hashed_password = await hash(password, 7);

    customer.hashed_password = hashed_password;
    await this.customerRepo.save(customer);

    await this.cacheManager.del(`reset-password-${customer.id}`);

    return {
      message: 'Password has been successfully reset',
      id: customer.id,
    };
  }
}
