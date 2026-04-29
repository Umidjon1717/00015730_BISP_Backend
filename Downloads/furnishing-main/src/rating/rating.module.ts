import { Module } from '@nestjs/common';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rating } from './entities/rating.entity';
import { JwtModule } from '@nestjs/jwt';
import { Product } from '../product/entities/product.entity';
import { Customer } from '../customer/entities/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rating, Product, Customer]), JwtModule],
  controllers: [RatingController],
  providers: [RatingService],
})
export class RatingModule {}
