import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { CartDetailModule } from './cart_detail/cart_detail.module';
import { OrderAddressesModule } from './order_addresses/order_addresses.module';
import { ProductModule } from './product/product.module';
import { CustomerModule } from './customer/customer.module';
import { ProductDetailModule } from './productDetail/productDetail.module';
import { OrderModule } from './order/order.module';
import { OrderDetailModule } from './order_detail/order_detail.module';
import { PaymentModule } from './payment/payment.module';
import { MailModule } from './mail/mail.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { OtpModule } from './otp/otp.module';
import { CacheModule } from '@nestjs/cache-manager';
import { DiscountModule } from './discount/discount.module';
import { RatingModule } from './rating/rating.module';
import { CategoryModule } from './category/category.module';
import { LikeModule } from './like/like.module';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    CacheModule.register({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PG_HOST || 'localhost',
      port: Number(process.env.PG_PORT) || 5432,
      username: process.env.PG_USER || 'postgres',
      password: process.env.PG_PASS || 'postgres',
      database: process.env.PG_DB || 'furnishing',
      synchronize: true,
      entities: [join(__dirname, '**/*.entity.{ts,js}')],
      logging: true,
      autoLoadEntities: true,
      retryAttempts: 3,
      retryDelay: 2000,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
    }),
    AdminModule,
    AuthModule,
    OrderModule,
    OrderDetailModule,
    PaymentModule,
    CartModule,
    CartDetailModule,
    OrderAddressesModule,
    ProductModule,
    CustomerModule,
    ProductDetailModule,
    MailModule,
    OtpModule,
    DiscountModule,
    RatingModule,
    CategoryModule,
    LikeModule,
    ReviewModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
