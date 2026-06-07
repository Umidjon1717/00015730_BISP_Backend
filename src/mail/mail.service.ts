import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { Customer } from '../customer/entities/customer.entity';

const EMAILJS_URL = 'https://api.emailjs.com/api/v1.0/email/send';

@Injectable()
export class MailService {
  private get cfg() {
    return {
      service_id: process.env.EMAILJS_SERVICE_ID ?? 'service_6fk7tod',
      template_id: process.env.EMAILJS_TEMPLATE_ID ?? 'template_mdg21vo',
      user_id: process.env.EMAILJS_PUBLIC_KEY ?? 'ytLvpgAYTPmAc-Nk9',
    };
  }

  private async send(email: string, passcode: string, time: string) {
    await axios.post(EMAILJS_URL, {
      ...this.cfg,
      template_params: { email, passcode, time },
    });
  }

  async sendMail(customer: Customer, otp: string) {
    console.log(`=============================`);
    console.log(`OTP for ${customer.email}: ${otp}`);
    console.log(`=============================`);
    try {
      await this.send(customer.email, otp, '3 minutes');
      console.log(`[MailService] OTP sent via EmailJS to ${customer.email}`);
    } catch (error) {
      console.error(
        `[MailService] EmailJS failed for ${customer.email}:`,
        error instanceof Error ? error.message : error,
      );
      throw new InternalServerErrorException('Failed to send OTP email');
    }
  }

  async sendResetPasswordMail(customer: Customer, otp: string) {
    console.log(`[MailService] Reset OTP for ${customer.email}: ${otp}`);
    try {
      await this.send(customer.email, otp, '1 hour');
      console.log(
        `[MailService] Reset email sent via EmailJS to ${customer.email}`,
      );
    } catch (error) {
      console.error(
        '[MailService] EmailJS reset failed:',
        error instanceof Error ? error.message : error,
      );
      throw new InternalServerErrorException('Failed to send password reset email');
    }
  }
}
