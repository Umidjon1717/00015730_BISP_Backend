import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';
import { Customer } from '../customer/entities/customer.entity';

@Injectable()
export class MailService {
  private get resend(): Resend {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new InternalServerErrorException('RESEND_API_KEY is not configured');
    }
    return new Resend(key);
  }

  async sendMail(customer: Customer, otp: string) {
    try {
      console.log(`[MailService] Attempting to send OTP email to ${customer.email}`);
      const { error } = await this.resend.emails.send({
        from: process.env.RESEND_FROM ?? 'onboarding@resend.dev',
        to: customer.email,
        subject: 'Welcome to our furnishing site',
        html: `
          <h1 style="color:#4CAF50;font-size:28px;text-align:center;font-family:Arial,sans-serif;">
            Hello, ${customer.first_name}
          </h1>
          <h2 style="font-size:20px;color:#555;text-align:center;font-family:Arial,sans-serif;">
            Please enter the OTP code to activate your account.
          </h2>
          <h3 style="color:#3d3d3d;font-size:28px;text-align:center;font-family:Arial,sans-serif;margin-top:20px;">
            ${otp}
          </h3>
        `,
        text: `Hello ${customer.first_name}, your OTP code is ${otp}.`,
      });
      if (error) {
        console.error(`[MailService] Resend API error for ${customer.email}:`, error);
        throw new Error(error.message);
      }
      console.log(`[MailService] OTP email successfully sent to ${customer.email}`);
    } catch (error) {
      console.error(
        `[MailService] OTP email send failed for ${customer.email}:`,
        error instanceof Error ? error.message : error,
      );
      throw new InternalServerErrorException('Failed to send OTP email');
    }
  }

  async sendResetPasswordMail(customer: Customer, otp: string) {
    try {
      const { error } = await this.resend.emails.send({
        from: process.env.RESEND_FROM ?? 'onboarding@resend.dev',
        to: customer.email,
        subject: 'Reset your Furnishing account password',
        html: `
          <h1 style="color:#4CAF50;font-size:26px;text-align:center;font-family:Arial,sans-serif;">
            Reset your password
          </h1>
          <h2 style="font-size:18px;color:#555;text-align:center;font-family:Arial,sans-serif;">
            Hi ${customer.first_name}, use the code below to reset your password.
          </h2>
          <h3 style="color:#3d3d3d;font-size:28px;text-align:center;font-family:Arial,sans-serif;margin-top:20px;">
            ${otp}
          </h3>
        `,
        text: `Hi ${customer.first_name}, your password reset code is ${otp}.`,
      });
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Password reset email send failed:', error);
      throw new InternalServerErrorException('Failed to send password reset email');
    }
  }
}
