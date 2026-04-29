import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { JwtModule } from '@nestjs/jwt';
import { Category } from '../category/entities/category.entity';
import { Likes } from '../like/entities/like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, Likes]), JwtModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
