import {
  BadRequestException,
  Inject,
  Injectable,
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

const otpFallbackCache = new Map<
  string,
  { value: string; expiresAt: number }
>();
const DEFAULT_COOKIE_MAX_AGE = 15 * 24 * 60 * 60 * 1000;

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp) private otpRepo: Repository<Otp>,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    private mailService: MailService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private normalizeOtp(input: string): string {
    const digits = String(input ?? '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length >= 4) return digits.slice(0, 4);
    return digits.padStart(4, '0');
  }

  private getCookieMaxAge(): number {
    const parsed = Number(process.env.COOKIE_TIME);
    return Number.isFinite(parsed) && parsed > 0
      ? parsed
      : DEFAULT_COOKIE_MAX_AGE;
  }

  private async safeCacheSet(key: string, value: string, ttlMs: number) {
    try {
      await this.cacheManager.set(key, value, ttlMs);
      return;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      otpFallbackCache.set(key, { value, expiresAt: Date.now() + ttlMs });
    }
  }

  private async safeCacheGet(key: string) {
    try {
      return await this.cacheManager.get<string>(key);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      const record = otpFallbackCache.get(key);
      if (!record) return null;
      if (record.expiresAt <= Date.now()) {
        otpFallbackCache.delete(key);
        return null;
      }
      return record.value;
    }
  }

  private async safeCacheDel(key: string) {
    try {
      await this.cacheManager.del(key);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      otpFallbackCache.delete(key);
    }
  }

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
    const existingOtp = await this.otpRepo.findOne({
      where: { email: customer.email, verified: false },
      order: { expiration_time: 'DESC' },
    });

    // Prevent duplicate OTP invalidation when frontend triggers OTP twice.
    if (existingOtp && existingOtp.expiration_time > now) {
      const existingDetails = {
        time: now,
        email: customer.email,
        otp_id: existingOtp.id,
      };
      const existingEncodedData = await encode(JSON.stringify(existingDetails));
      await this.safeCacheSet(existingOtp.otp, existingEncodedData, 180000);
      return {
        id: customer.id,
        SMS: 'OTP code already sent. Please use the latest one from your email',
      };
    }

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

    await this.safeCacheSet(otp, encodedData, 180000);

    void this.mailService.sendMail(customer, otp).catch((error) => {
      console.error(
        `[OtpService] Background mail send failed for ${customer.email}:`,
        error instanceof Error ? error.message : error,
      );
      if (error instanceof Error && error.stack) {
        console.error('[OtpService] Stack:', error.stack);
      }
    });

    return {
      id: customer.id,
      SMS: 'OTP code sent to your email',
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto, res: Response) {
    const { otp, email } = verifyOtpDto;
    const normalizedOtp = this.normalizeOtp(otp);

    const currentTime = new Date();
    const data: any = await this.safeCacheGet(normalizedOtp);
    const customer = await this.customerRepo.findOneBy({ email: email });

    if (!customer) {
      throw new BadRequestException('Customer not found');
    }

    let resultOtp: Otp | null = null;
    if (data) {
      try {
        const decodedData = await decode(data);
        const details = JSON.parse(decodedData);
        if (details.email !== email) {
          throw new BadRequestException('OTP has not been sent to this email');
        }
        resultOtp = await this.otpRepo.findOne({
          where: { id: details.otp_id },
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        resultOtp = null;
      }
    } else {
      // Fallback when cache is unavailable/restarted: verify by latest OTP in DB.
      resultOtp = await this.otpRepo.findOne({
        where: { email, verified: false },
        order: { expiration_time: 'DESC' },
      });
    }

    if (!resultOtp) {
      resultOtp = await this.otpRepo.findOne({
        where: { email, verified: false, otp: normalizedOtp },
        order: { expiration_time: 'DESC' },
      });
    }

    if (!resultOtp) {
      throw new BadRequestException('This OTP not found');
    }

    if (resultOtp.verified) {
      throw new BadRequestException('This client is already activated');
    }

    if (resultOtp.expiration_time < currentTime) {
      throw new BadRequestException('This OTP has expired');
    }

    if (this.normalizeOtp(resultOtp.otp) !== normalizedOtp) {
      throw new BadRequestException('OTP does not match');
    }

    await this.customerRepo.update({ email }, { is_active: true });
    await this.otpRepo.update({ id: resultOtp.id }, { verified: true });
    await this.safeCacheDel(normalizedOtp);

    const { access_token, refresh_token } =
      await this.customerGenerateTokens(customer);

    if (!access_token || !refresh_token) {
      throw new BadRequestException('Error generating tokens');
    }

    await this.updateRefreshToken(customer.id, refresh_token);

    const newCustomer = await this.customerRepo.findOneBy({ id: customer.id });
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: this.getCookieMaxAge(),
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
