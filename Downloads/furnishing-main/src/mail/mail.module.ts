import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get<string>('SMTP_HOST') || 'localhost',
          port: Number(config.get<number>('SMTP_PORT')) || 587,
          secure: config.get<boolean>('SMTP_SECURE') ?? false,
          auth: {
            user: config.get<string>('SMTP_USER') || 'no-reply@example.com',
            pass: config.get<string>('SMTP_PASSWORD') || '',
          },
          greetingTimeout: 15000,
          connectionTimeout: 15000,
          socketTimeout: 15000,
        },
        defaults: {
          from: `Furnishing <${config.get<string>('SMTP_USER') || 'no-reply@example.com'}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
