import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { randomBytes } from 'crypto';
import { generate } from 'otp-generator';
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
import { GoogleSignInDto } from '../dto/google-signin.dto';
import { OAuth2Client } from 'google-auth-library';

const resetFallbackCache = new Map<string, { value: string; expiresAt: number }>();
const DEFAULT_COOKIE_MAX_AGE = 15 * 24 * 60 * 60 * 1000;

@Injectable()
export class CustomerAuthService {
  constructor(
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    private readonly customerService: CustomerService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async safeCacheSet(key: string, value: string, ttlMs: number) {
    try {
      await this.cacheManager.set(key, value, ttlMs);
      return;
    } catch (_error) {
      resetFallbackCache.set(key, { value, expiresAt: Date.now() + ttlMs });
    }
  }

  private async safeCacheGet(key: string) {
    try {
      return await this.cacheManager.get<string>(key);
    } catch (_error) {
      const record = resetFallbackCache.get(key);
      if (!record) return null;
      if (record.expiresAt <= Date.now()) {
        resetFallbackCache.delete(key);
        return null;
      }
      return record.value;
    }
  }

  private async safeCacheDel(key: string) {
    try {
      await this.cacheManager.del(key);
    } catch (_error) {
      resetFallbackCache.delete(key);
    }
  }

  private getCookieMaxAge(): number {
    const parsed = Number(process.env.COOKIE_TIME);
    return Number.isFinite(parsed) && parsed > 0
      ? parsed
      : DEFAULT_COOKIE_MAX_AGE;
  }

  private getResetPasswordSecret(): string {
    // Backward compatible fallback: older deployments might not have
    // RESET_PASSWORD_SECRET, but ACCESS_TOKEN_KEY is already configured.
    return process.env.RESET_PASSWORD_SECRET ?? process.env.ACCESS_TOKEN_KEY;
  }

  private getGoogleClientId(): string {
    const id = process.env.GOOGLE_CLIENT_ID;
    if (!id) {
      throw new InternalServerErrorException(
        'GOOGLE_CLIENT_ID is not configured',
      );
    }
    return id;
  }

  private getGoogleClient(): OAuth2Client {
    return new OAuth2Client(this.getGoogleClientId());
  }

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
      maxAge: this.getCookieMaxAge(),
    });

    const response = {
      id: customer.id,
      access_token,
      is_active: customer.is_active,
    };
    await this.updateRefreshToken(customer.id, refresh_token);
    return createApiResponse(200, 'Customer signed in successfully', response);
  }

  async googleSignIn(res: Response, googleSignInDto: GoogleSignInDto) {
    const { idToken } = googleSignInDto;

    const client = this.getGoogleClient();
    let payload:
      | {
          email?: string;
          email_verified?: boolean;
          given_name?: string;
          family_name?: string;
        }
      | undefined;

    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: this.getGoogleClientId(),
      });
      payload = ticket.getPayload() ?? undefined;
    } catch (_error) {
      throw new UnauthorizedException('Invalid Google token');
    }

    const email = payload?.email;
    if (!email) {
      throw new BadRequestException('Google account email is missing');
    }
    if (payload?.email_verified === false) {
      throw new UnauthorizedException('Google email is not verified');
    }

    let customer = await this.customerRepo.findOneBy({ email });

    if (!customer) {
      const firstName = payload?.given_name?.trim() || 'Google';
      const lastName = payload?.family_name?.trim() || 'User';
      const randomPassword = randomBytes(32).toString('hex');
      const hashed_password = await hash(randomPassword, 7);

      customer = await this.customerRepo.save({
        email,
        first_name: firstName,
        last_name: lastName,
        phone_number: '',
        hashed_password,
        is_active: true,
      });
    } else {
      // Treat Google sign-in as verified/activated.
      if (!customer.is_active) {
        customer.is_active = true;
      }
      if (!customer.first_name && payload?.given_name) {
        customer.first_name = payload.given_name;
      }
      if (!customer.last_name && payload?.family_name) {
        customer.last_name = payload.family_name;
      }
      await this.customerRepo.save(customer);
    }

    const { access_token, refresh_token } =
      await this.customerGenerateTokens(customer);

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: this.getCookieMaxAge(),
    });

    await this.updateRefreshToken(customer.id, refresh_token);
    return createApiResponse(200, 'Customer signed in successfully', {
      id: customer.id,
      access_token,
      is_active: customer.is_active,
    });
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
      maxAge: this.getCookieMaxAge(),
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

      const resetSecret = this.getResetPasswordSecret();
      if (!resetSecret) {
        throw new InternalServerErrorException(
          'Reset password secret is not configured',
        );
      }

      const payload = { email: customer.email, id: customer.id };
      const token = this.jwtService.sign(payload, {
        secret: resetSecret,
        expiresIn: '1h',
      });

      await this.safeCacheSet(`reset-password-${customer.id}`, token, 3600000);

      // Create a short reset code and email it to the user.
      const otp = generate(4, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
        digits: true,
      });

      await this.safeCacheSet(
        `reset-password-otp-${customer.id}`,
        otp,
        3600000,
      );

      await this.mailService.sendResetPasswordMail(customer, otp);

      return {
        message: 'Password reset code sent to your email',
      };
    } catch (error) {
      console.error('Error during forgot password process:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to send password reset code to your email',
      );
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { confirm_password, email, password, otp } = resetPasswordDto;

    if (confirm_password !== password) {
      throw new BadRequestException(
        'Passwords do not match. Please check both fields',
      );
    }

    const customer = await this.customerRepo.findOneBy({ email });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Prefer OTP verification when provided (intended flow).
    if (otp) {
      const cachedOtp: string = await this.safeCacheGet(
        `reset-password-otp-${customer.id}`,
      );
      if (!cachedOtp || cachedOtp !== otp) {
        throw new BadRequestException('Invalid or expired OTP');
      }
    } else {
      // Backward compatible JWT verification fallback.
      const resetSecret = this.getResetPasswordSecret();
      if (!resetSecret) {
        throw new InternalServerErrorException(
          'Reset password secret is not configured',
        );
      }

      const cachedToken: string = await this.safeCacheGet(
        `reset-password-${customer.id}`,
      );
      if (!cachedToken) {
        throw new BadRequestException('Password reset link expired or invalid');
      }

      let decodedToken: any;
      try {
        decodedToken = this.jwtService.verify(cachedToken, {
          secret: resetSecret,
        });
      } catch (_error) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      if (decodedToken.email !== email) {
        throw new BadRequestException('Email mismatch');
      }
    }

    const hashed_password = await hash(password, 7);

    customer.hashed_password = hashed_password;
    await this.customerRepo.save(customer);

    await this.safeCacheDel(`reset-password-${customer.id}`);
    await this.safeCacheDel(`reset-password-otp-${customer.id}`);

    return {
      message: 'Password has been successfully reset',
      id: customer.id,
    };
  }
}
