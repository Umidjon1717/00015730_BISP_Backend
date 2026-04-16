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
    } catch (error) {
      // Keep detailed reason in server logs while returning a safe message to clients.
      console.error('OTP email send failed:', error);
      throw new InternalServerErrorException('Failed to send OTP email');
    }
  }

  async sendResetPasswordMail(customer: Customer, otp: string) {
    try {
      await this.mailerService.sendMail({
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
    } catch (error) {
      console.error('Password reset email send failed:', error);
      throw new InternalServerErrorException(
        'Failed to send password reset email',
      );
    }
  }
}
