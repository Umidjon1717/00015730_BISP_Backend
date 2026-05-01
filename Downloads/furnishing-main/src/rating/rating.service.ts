import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Rating } from './entities/rating.entity';
import { Repository } from 'typeorm';
import { createApiResponse } from '../common/utils';
import { PaginationDto } from '../admin/dto/pagination.dto';
import { Product } from '../product/entities/product.entity';
import { Customer } from '../customer/entities/customer.entity';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating) private readonly ratingRepo: Repository<Rating>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}
  async create(createRatingDto: CreateRatingDto) {
    const product = await this.productRepo.findOne({
      where: { id: createRatingDto.product_id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const customer = await this.customerRepo.findOne({
      where: { id: createRatingDto.customer_id },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const existingRating = await this.ratingRepo.findOne({
      where: {
        product_id: createRatingDto.product_id,
        customer_id: createRatingDto.customer_id,
      },
    });

    if (existingRating) {
      throw new ConflictException('Customer has already rated this product');
    }

    const rating = await this.ratingRepo.save(createRatingDto);

    const avgRatingResult = await this.ratingRepo.query(
      `SELECT AVG(rating) as avgRating FROM ratings WHERE product_id = $1`,
      [createRatingDto.product_id],
    );

    const avgRating = avgRatingResult[0].avgRating;
    product.averageRating = avgRating;

    await this.productRepo.save(product);

    return createApiResponse(201, 'Rating created successfully', { rating });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const total = await this.ratingRepo.count();
    const calculatedSkip = (page - 1) * limit;
    const ratings = await this.ratingRepo.find({
      relations: [],
      skip: calculatedSkip,
      take: limit,
    });
    return createApiResponse(200, 'List of ratings retrieved successfully', {
      ratings,
      total,
      limit,
      page,
    });
  }

  async findOne(id: number) {
    const rating = await this.ratingRepo.findOne({ where: { id } });
    if (!rating) {
      throw new NotFoundException(`Rating with id ${id} not found`);
    }
    return createApiResponse(
      200,
      `Rating with id ${id} retrieved successfully`,
      { rating },
    );
  }

  async update(id: number, updateRatingDto: UpdateRatingDto) {
    const existingRating = await this.ratingRepo.findOne({ where: { id } });
    if (!existingRating) {
      throw new NotFoundException(`Rating with id ${id} not found`);
    }

    await this.ratingRepo.update(id, updateRatingDto);
    const updatedRating = await this.ratingRepo.findOne({ where: { id } });

    return createApiResponse(200, 'Rating updated successfully', {
      updatedRating,
    });
  }

  async remove(id: number) {
    const rating = await this.ratingRepo.findOne({ where: { id } });
    if (!rating) {
      throw new NotFoundException(`Rating with id ${id} not found`);
    }

    await this.ratingRepo.delete(id);
    return createApiResponse(200, `Rating with id ${id} removed successfully`);
  }
}
