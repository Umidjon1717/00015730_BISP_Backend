import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Customer } from '../customer/entities/customer.entity';
import { JwtModule } from '@nestjs/jwt';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderAddressesModule } from '../order_addresses/order_addresses.module';
import { OrderDetailModule } from '../order_detail/order_detail.module';
import { Product } from '../product/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Customer, Product]),
    JwtModule,
    OrderAddressesModule,
    OrderDetailModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
