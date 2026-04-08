import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateOtpDto } from './dto/create-otp.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';
import { Repository } from 'typeorm';
import { Customer } from '../customer/entities/customer.entity';
import { generate } from 'otp-generator';
import { AddMinutesToDate } from '../common/helpers/add-minute';
import * as uuid from 'uuid';
import { decode, encode } from '../common/helpers/crypto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { hash } from 'bcrypt';
import { Response } from 'express';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp) private otpRepo: Repository<Otp>,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    private mailService: MailService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createOtpDto: CreateOtpDto) {
    const { email } = createOtpDto;
    const customer = await this.customerRepo.findOneBy({ email });

    if (!customer) {
      throw new UnauthorizedException('User not found');
    }

    const otp = generate(4, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });

    const now = new Date();
    const expiration_time = AddMinutesToDate(now, 3);
    await this.otpRepo.delete({ email: customer.email });

    const newOtp = await this.otpRepo.save({
      id: uuid.v4(),
      otp,
      expiration_time,
      email: customer.email,
    });

    const details = {
      time: now,
      email: customer.email,
      otp_id: newOtp.id,
    };
    const encodedData = await encode(JSON.stringify(details));

    try {
      await this.mailService.sendMail(customer, otp);
    } catch (error) {
      console.log('ERROR ON OTP CREATE, ', error);
      throw new InternalServerErrorException(
        'Error sending activation OTP code',
      );
    }

    await this.cacheManager.set(otp, encodedData, 180000);
    return {
      id: customer.id,
      SMS: 'OTP code sent to your email',
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto, res: Response) {
    const { otp, email } = verifyOtpDto;

    const currentTime = new Date();
    const data: any = await this.cacheManager.get(otp);
    const customer = await this.customerRepo.findOneBy({ email: email });

    if (!customer) {
      throw new BadRequestException('Customer not found');
    }

    if (!data) {
      throw new BadRequestException('Code incorrect');
    }

    const decodedData = await decode(data);
    const details = JSON.parse(decodedData);

    if (details.email !== email) {
      throw new BadRequestException('OTP has not been sent to this email');
    }

    const resultOtp = await this.otpRepo.findOne({
      where: { id: details.otp_id },
    });
    if (!resultOtp) {
      throw new BadRequestException('This OTP not found');
    }

    if (resultOtp.verified) {
      throw new BadRequestException('This client is already activated');
    }

    if (resultOtp.expiration_time < currentTime) {
      throw new BadRequestException('This OTP has expired');
    }

    if (resultOtp.otp !== otp) {
      throw new BadRequestException('OTP does not match');
    }

    await this.customerRepo.update({ email }, { is_active: true });
    await this.otpRepo.update({ id: details.otp_id }, { verified: true });
    await this.cacheManager.del(otp);

    const { access_token, refresh_token } =
      await this.customerGenerateTokens(customer);

    if (!access_token || !refresh_token) {
      throw new BadRequestException('Error generating tokens');
    }

    await this.updateRefreshToken(customer.id, refresh_token);

    const newCustomer = await this.customerRepo.findOneBy({ id: customer.id });
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: Number(process.env.COOKIE_TIME),
    });
    return {
      message: 'You have been activated',
      id: newCustomer.id,
      access_token,
    };
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
}
