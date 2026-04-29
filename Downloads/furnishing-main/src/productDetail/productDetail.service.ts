import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDetailDto } from './dto/create-productDetail.dto';
import { UpdateProductDetailDto } from './dto/update-productDetail.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { ProductDetail } from './entities/productDetail.entity';
import { PaginationDto } from 'src/admin/dto/pagination.dto';
import { createApiResponse } from '../common/utils';
import { Product } from '../product/entities/product.entity';

@Injectable()
export class ProductDetailService {
  constructor(
    @InjectRepository(ProductDetail)
    private productDetailRepo: Repository<ProductDetail>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async create(createProductDetailDto: CreateProductDetailDto) {
    const product = await this.productRepo.findOne({
      where: { id: createProductDetailDto.productId },
    });
    if (!product) {
      throw new NotFoundException(
        `Product with id ${createProductDetailDto.productId} not found`,
      );
    }
    const newProductDetail = this.productDetailRepo.create(
      createProductDetailDto,
    );
    await this.productDetailRepo.save(newProductDetail);
    return createApiResponse(201, 'Product detail created successfully', {
      newProductDetail,
    });
  }

  async findAll(query: PaginationDto) {
    const { filter, order = 'asc', page, limit } = query;

    const skip = (page - 1) * limit;

    const where = filter
      ? [{ name: Like(`%${filter}%`) }, { description: Like(`%${filter}%`) }]
      : {};

    const [products, total] = await this.productDetailRepo.findAndCount({
      where,
      order: {
        productId: order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
      },
      skip,
      take: limit,
    });

    return {
      products,
      page,
      limit,
      total,
    };
  }
  async findOne(id: number) {
    const productDetail = await this.productDetailRepo.findOneBy({ id });
    if (!productDetail) {
      throw new NotFoundException(`ProductDetail with ID ${id} not found.`);
    }
    return productDetail;
  }

  async update(id: number, updateProductDetailDto: UpdateProductDetailDto) {
    const existingProductDetail = await this.productDetailRepo.findOne({
      where: { id },
    });

    if (!existingProductDetail) {
      throw new NotFoundException(`ProductDetail with ID ${id} not found.`);
    }

    await this.productDetailRepo.update(id, updateProductDetailDto);

    const updatedProductDetail = await this.productDetailRepo.findOne({
      where: { id },
    });

    return createApiResponse(200, 'Product detail updated successfully', {
      updatedProductDetail,
    });
  }

  async remove(id: number) {
    const productDetail = await this.productDetailRepo.findOne({
      where: { id },
    });

    if (!productDetail) {
      throw new NotFoundException(`ProductDetail with id ${id} not found`);
    }

    await this.productDetailRepo.delete(id);
    return createApiResponse(
      200,
      `ProductDetail with id ${id} removed successfully`,
    );
  }
}
