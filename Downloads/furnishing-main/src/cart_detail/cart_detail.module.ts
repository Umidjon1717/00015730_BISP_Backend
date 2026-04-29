import { Module } from '@nestjs/common';
import { CartDetailService } from './cart_detail.service';
import { CartDetailController } from './cart_detail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartDetail } from './entities/cart_detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CartDetail])],
  controllers: [CartDetailController],
  providers: [CartDetailService],
})
export class CartDetailModule {}
