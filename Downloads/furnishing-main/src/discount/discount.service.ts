import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Discount } from './entities/discount.entity';
import { Repository } from 'typeorm';
import { createApiResponse } from '../common/utils';
import { PaginationDto } from '../admin/dto/pagination.dto';

@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(Discount)
    private readonly discountRepo: Repository<Discount>,
  ) {}
  async create(createDiscountDto: CreateDiscountDto) {
    const newDiscount = this.discountRepo.create(createDiscountDto);
    await this.discountRepo.save(newDiscount);
    return createApiResponse(201, 'Discount created successfully', {
      newDiscount,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const total = await this.discountRepo.count();
    const calculatedSkip = (page - 1) * limit;
    const discounts = await this.discountRepo.find({
      relations: [],
      skip: calculatedSkip,
      take: limit,
    });
    return createApiResponse(200, 'List of discounts retrieved successfully', {
      discounts,
      total,
      limit,
      page,
    });
  }

  async findOne(id: number) {
    const discount = await this.discountRepo.findOne({ where: { id } });
    if (!discount) {
      throw new NotFoundException(`Discount with id ${id} not found`);
    }
    return createApiResponse(
      200,
      `Discount with id ${id} retrieved successfully`,
      {discount},
    );
  }

  async update(id: number, updateDiscountDto: UpdateDiscountDto) {
    const existingDis = await this.discountRepo.findOne({ where: { id } });
    if (!existingDis) {
      throw new NotFoundException(`Discount with id ${id} not found`);
    }

    await this.discountRepo.update(id, updateDiscountDto);
    const updatedDis = await this.discountRepo.findOne({ where: { id } });

    return createApiResponse(200, 'Discount updated successfully', {updatedDis});
  }

  async remove(id: number) {
    const discount = await this.discountRepo.findOne({ where: { id } });
    if (!discount) {
      throw new NotFoundException(`Discount with id ${id} not found`);
    }

    await this.discountRepo.delete(id);
    return createApiResponse(
      200,
      `Discount with id ${id} removed successfully`,
    );
  }
}
