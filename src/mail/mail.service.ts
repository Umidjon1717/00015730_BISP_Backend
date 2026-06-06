import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';
import { Customer } from '../customer/entities/customer.entity';

@Injectable()
export class MailService {
  private get resend(): Resend {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new InternalServerErrorException('RESEND_API_KEY is not configured');
    return new Resend(key);
  }

  async sendMail(customer: Customer, otp: string) {
    console.log(`=============================`);
    console.log(`OTP for ${customer.email}: ${otp}`);
    console.log(`=============================`);

    try {
      const { error } = await this.resend.emails.send({
        from: process.env.RESEND_FROM ?? 'onboarding@resend.dev',
        to: customer.email,
        subject: 'Your OTP code - Furnishing',
        html: `
          <h1 style="color:#B8960C;font-size:28px;text-align:center;font-family:Arial,sans-serif;">
            Hello, ${customer.first_name}
          </h1>
          <h2 style="font-size:20px;color:#555;text-align:center;font-family:Arial,sans-serif;">
            Please enter the OTP code to activate your account.
          </h2>
          <h3 style="color:#3d3d3d;font-size:36px;text-align:center;font-family:Arial,sans-serif;
                     background:#f5f5f5;padding:16px;border-radius:8px;letter-spacing:8px;">
            ${otp}
          </h3>
          <p style="color:#999;font-size:12px;text-align:center;">This code expires in 3 minutes.</p>
        `,
        text: `Hello ${customer.first_name}, your OTP code is ${otp}. It expires in 3 minutes.`,
      });
      if (error) {
        console.error(`[MailService] Resend error for ${customer.email}:`, error);
        throw new Error(error.message);
      }
      console.log(`[MailService] OTP email sent successfully to ${customer.email}`);
    } catch (error) {
      console.error(
        `[MailService] Failed to send OTP email to ${customer.email}:`,
        error instanceof Error ? error.message : error,
      );
      throw new InternalServerErrorException('Failed to send OTP email');
    }
  }

  async sendResetPasswordMail(customer: Customer, otp: string) {
    console.log(`[MailService] Reset OTP for ${customer.email}: ${otp}`);
    try {
      const { error } = await this.resend.emails.send({
        from: process.env.RESEND_FROM ?? 'onboarding@resend.dev',
        to: customer.email,
        subject: 'Reset your Furnishing password',
        html: `
          <h1 style="color:#B8960C;font-size:26px;text-align:center;font-family:Arial,sans-serif;">
            Reset your password
          </h1>
          <h2 style="font-size:18px;color:#555;text-align:center;font-family:Arial,sans-serif;">
            Hi ${customer.first_name}, use the code below to reset your password.
          </h2>
          <h3 style="color:#3d3d3d;font-size:36px;text-align:center;font-family:Arial,sans-serif;
                     background:#f5f5f5;padding:16px;border-radius:8px;letter-spacing:8px;">
            ${otp}
          </h3>
          <p style="color:#999;font-size:12px;text-align:center;">This code expires in 1 hour.</p>
        `,
        text: `Hi ${customer.first_name}, your password reset code is ${otp}.`,
      });
      if (error) throw new Error(error.message);
    } catch (error) {
      console.error('Reset password email failed:', error instanceof Error ? error.message : error);
      throw new InternalServerErrorException('Failed to send password reset email');
    }
  }
}
