import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartDetailDto } from './dto/create-cart_detail.dto';
import { UpdateCartDetailDto } from './dto/update-cart_detail.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CartDetail } from './entities/cart_detail.entity';
import { Repository } from 'typeorm';
import { createApiResponse } from '../common/utils';
import { PaginationDto } from '../admin/dto/pagination.dto';

@Injectable()
export class CartDetailService {
  constructor(
    @InjectRepository(CartDetail)
    private readonly cartDetailRepo: Repository<CartDetail>,
  ) {}
  async create(createCartDetailDto: CreateCartDetailDto) {
    const newCartDetail = this.cartDetailRepo.create(createCartDetailDto);
    await this.cartDetailRepo.save(newCartDetail);
    return createApiResponse(201, 'Cart-Detail created successfully', {
      newCartDetail,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const total = await this.cartDetailRepo.count();
    const calculatedSkip = (page - 1) * limit;
    const cartDetails = await this.cartDetailRepo.find({
      relations: ['cart'],
      skip: calculatedSkip,
      take: limit,
    }); // ['product']
    return createApiResponse(
      200,
      'List of cart-details retrieved successfully',
      { cartDetails, total, limit, page },
    );
  }

  async findOne(id: number) {
    const cartDetail = await this.cartDetailRepo.findOne({ where: { id } });
    if (!cartDetail) {
      throw new NotFoundException(`Cart-Detail with id ${id} not found`);
    }
    return createApiResponse(
      200,
      `Cart-Detail with id ${id} retrieved successfully`,
      { cartDetail },
    );
  }

  async update(id: number, updateCartDetailDto: UpdateCartDetailDto) {
    const existingCartDetail = await this.cartDetailRepo.findOne({
      where: { id },
    });
    if (!existingCartDetail) {
      throw new NotFoundException(`Cart-Detail with id ${id} not found`);
    }

    await this.cartDetailRepo.update(id, updateCartDetailDto);
    const updatedCartDetail = await this.cartDetailRepo.findOne({
      where: { id },
    });

    return createApiResponse(200, 'Cart-Detail updated successfully', {
      updatedCartDetail,
    });
  }

  async remove(id: number) {
    const cartDetail = await this.cartDetailRepo.findOne({ where: { id } });
    if (!cartDetail) {
      throw new NotFoundException(`Cart-Detail with id ${id} not found`);
    }

    await this.cartDetailRepo.delete(id);
    return createApiResponse(
      200,
      `Cart-Detail with id ${id} removed successfully`,
    );
  }
}
