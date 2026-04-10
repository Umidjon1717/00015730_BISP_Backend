import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Customer } from '../customer/entities/customer.entity';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(customer: Customer, otp: string) {
    try {
      await this.mailerService.sendMail({
        to: customer.email,
        subject: 'Welcome to our furnishing site',
        template: './confirm',
        context: {
          first_name: customer.first_name,
          otp,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to send OTP email');
    }
  }
}
