import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { Customer } from '../customer/entities/customer.entity';

const EMAILJS_URL = 'https://api.emailjs.com/api/v1.0/email/send';

@Injectable()
export class MailService {
  private get cfg() {
    return {
      service_id: process.env.EMAILJS_SERVICE_ID ?? 'service_6fk7tod',
      template_id: process.env.EMAILJS_TEMPLATE_ID ?? 'template_oqky489',
      user_id: process.env.EMAILJS_PUBLIC_KEY ?? 'ytLvpgAYTPmAc-Nk9',
      accessToken:
        process.env.EMAILJS_PRIVATE_KEY ?? 'lvXJF6zxyX_oODo0dNvKq',
    };
  }

  private async send(email: string, passcode: string, time: string) {
    const body = {
      ...this.cfg,
      template_params: { email, passcode, time },
    };
    console.log('[EmailJS] Sending with config:', {
      service_id: body.service_id,
      template_id: body.template_id,
      user_id: body.user_id,
      hasAccessToken: !!body.accessToken,
    });
    try {
      const res = await axios.post(EMAILJS_URL, body, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('[EmailJS] Response:', res.status, res.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error(
          '[EmailJS] Error response:',
          err.response?.status,
          JSON.stringify(err.response?.data),
        );
      }
      throw err;
    }
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
