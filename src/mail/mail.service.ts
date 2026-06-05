import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { setDefaultResultOrder } from 'dns';
import { Customer } from '../customer/entities/customer.entity';

// Force IPv4 DNS resolution — Render blocks IPv6 outbound SMTP
setDefaultResultOrder('ipv4first');

@Injectable()
export class MailService {
  private createTransport() {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    const host = process.env.SMTP_HOST ?? 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT ?? 465);
    if (!user || !pass) {
      throw new InternalServerErrorException('SMTP_USER or SMTP_PASSWORD is not configured');
    }
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      requireTLS: port === 587,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    } as nodemailer.TransportOptions & { family?: number; requireTLS?: boolean });
  }

  async sendMail(customer: Customer, otp: string) {
    // Always log OTP to console as fallback for debugging
    console.log(`[MailService] OTP for ${customer.email}: ${otp}`);

    try {
      const transporter = this.createTransport();
      await transporter.sendMail({
        from: `"Furnishing" <${process.env.SMTP_USER}>`,
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
      const transporter = this.createTransport();
      await transporter.sendMail({
        from: `"Furnishing" <${process.env.SMTP_USER}>`,
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
    } catch (error) {
      console.error('Reset password email failed:', error instanceof Error ? error.message : error);
      throw new InternalServerErrorException('Failed to send password reset email');
    }
  }
}
