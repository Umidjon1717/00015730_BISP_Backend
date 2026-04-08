import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';
import { Customer } from '../customer/entities/customer.entity';
import { MailModule } from '../mail/mail.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Otp, Customer]), MailModule, JwtModule],
  controllers: [OtpController],
  providers: [OtpService],
})
export class OtpModule {}
