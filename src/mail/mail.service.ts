import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Customer } from '../customer/entities/customer.entity';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(customer: Customer, otp: string) {
    await this.mailerService.sendMail({
      to: customer.email,
      subject: 'Welcome to our furnishing site',
      template: './confirm',
      context: {
        first_name: customer.first_name,
        otp,
      },
    });
  }
}
