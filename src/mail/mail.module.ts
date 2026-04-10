import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as Handlebars from 'handlebars';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => {
        const host = config.get<string>('SMTP_HOST');
        const user = config.get<string>('SMTP_USER');
        const pass = config.get<string>('SMTP_PASSWORD');
        const port = Number(config.get<string>('SMTP_PORT') ?? 587);

        return {
          transport: {
            host,
            port,
            secure: port === 465,
            requireTLS: port === 587,
            auth: {
              user,
              pass,
            },
            tls: {
              rejectUnauthorized: false,
            },
          },
        defaults: {
          from: `Furnishing <${config.get<string>('SMTP_USER')}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: {
            compile: (templateString: string, context: any) => {
              const template = Handlebars.compile(templateString);
              return template(context);
            },
          },
          options: {
            strict: true,
          },
        },
      };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}