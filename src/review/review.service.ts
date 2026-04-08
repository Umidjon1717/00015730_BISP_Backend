import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';
import { Customer } from '../customer/entities/customer.entity';
import { createApiResponse } from '../common/utils';
import { PaginationDto } from '../admin/dto/pagination.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review) private readonly reviewRepo: Repository<Review>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  async create(createReviewDto: CreateReviewDto) {
    const customer = await this.customerRepo.findOne({
      where: { id: createReviewDto.customerId },
    });
    if (!customer) {
      throw new NotFoundException(
        `Customer with id ${createReviewDto.customerId} not found`,
      );
    }

    const newReview = this.reviewRepo.create(createReviewDto);
    await this.reviewRepo.save(newReview);
    return createApiResponse(201, 'Review created successfully', { newReview });
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;
    const calculatedSkip = (page - 1) * limit;
    const total = await this.reviewRepo.count();
    const review = await this.reviewRepo.find({
      relations: ['customer', 'product'], // ['product', 'customer']
      skip: calculatedSkip,
      take: limit,
    });
    return createApiResponse(200, 'List of reviews retrieved successfully', {
      review,
      total,
      limit,
      page,
    });
  }

  async findOne(id: number) {
    const review = await this.reviewRepo.findOne({
      where: { id },
      relations: ['customer', 'product'],
    });
    if (!review) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }
    return createApiResponse(
      200,
      `Review with id ${id} retrieved successfully`,
      {
        review,
      },
    );
  }

  async update(id: number, updateReviewDto: UpdateReviewDto) {
    const existingReview = await this.reviewRepo.findOne({
      where: { id },
    });
    if (!existingReview) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }
    await this.reviewRepo.update(id, updateReviewDto);
    const updatedReview = await this.reviewRepo.findOne({
      where: { id },
    });

    return createApiResponse(200, 'Review updated successfully', {
      updatedReview,
    });
  }

  async remove(id: number) {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }

    await this.reviewRepo.delete(id);
    return createApiResponse(200, `Review with id ${id} removed successfully`);
  }
}
