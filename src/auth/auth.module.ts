import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from '../admin/entities/admin.entity';
import { AdminAuthController } from './admin-auth/admin.auth.controller';
import { CustomerAuthController } from './customer-auth/customer.auth.controller';
import { AdminAuthService } from './admin-auth/admin.auth.service';
import { CustomerAuthService } from './customer-auth/customer.auth.service';
import { Customer } from '../customer/entities/customer.entity';
import { CustomerModule } from '../customer/customer.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    AdminModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Admin, Customer]),
    CustomerModule,
    MailModule,
  ],
  controllers: [AdminAuthController, CustomerAuthController],
  providers: [AdminAuthService, CustomerAuthService],
  exports: [AdminAuthService, CustomerAuthService, JwtModule],
})
export class AuthModule {}
