import { Module } from '@nestjs/common';
import { OrderAddressesService } from './order_addresses.service';
import { OrderAddressesController } from './order_addresses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderAddress } from './entities/order_address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderAddress])],
  controllers: [OrderAddressesController],
  providers: [OrderAddressesService],
  exports: [OrderAddressesService],
})
export class OrderAddressesModule {}
