import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDetailDto } from './dto/create-order_detail.dto';
import { UpdateOrderDetailDto } from './dto/update-order_detail.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDetail } from './entities/order_detail.entity';
import { Repository } from 'typeorm';
import { createApiResponse } from '../common/utils';
import { PaginationDto } from '../admin/dto/pagination.dto';

@Injectable()
export class OrderDetailService {
  constructor(
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepo: Repository<OrderDetail>,
  ) {}
  async create(createOrderDetailDto: CreateOrderDetailDto) {
    const order_detail = this.orderDetailRepo.save(createOrderDetailDto);
    return order_detail;
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;
    const calculatedSkip = (page - 1) * limit;
    const total = await this.orderDetailRepo.count();
    const orderDetail = await this.orderDetailRepo.find({
      relations: ['order', 'product'],
      skip: calculatedSkip,
      take: limit,
    });
    return createApiResponse(
      200,
      'List of order-detail retrieved successfully',
      {
        orderDetail,
        total,
        limit,
        page,
      },
    );
  }

  async findOne(id: number) {
    const orderDetail = await this.orderDetailRepo.findOne({ where: { id } });
    if (!orderDetail) {
      throw new NotFoundException(`Order-Detail with id ${id} not found`);
    }
    return createApiResponse(
      200,
      `Order-Detail with id ${id} retrieved successfully`,
      { orderDetail },
    );
  }

  async update(id: number, updateOrderDetailDto: UpdateOrderDetailDto) {
    const existingOrderDetail = await this.orderDetailRepo.findOne({
      where: { id },
    });
    if (!existingOrderDetail) {
      throw new NotFoundException(`Order-Detail with id ${id} not found`);
    }

    await this.orderDetailRepo.update(id, updateOrderDetailDto);
    const updatedOrderDetail = await this.orderDetailRepo.findOne({
      where: { id },
    });

    return createApiResponse(200, 'Order-Detail updated successfully', {
      updatedOrderDetail,
    });
  }

  async remove(id: number) {
    const orderDetail = await this.orderDetailRepo.findOne({ where: { id } });
    if (!orderDetail) {
      throw new NotFoundException(`Order-Detail with id ${id} not found`);
    }
    await this.orderDetailRepo.delete(id);
    return createApiResponse(
      200,
      `Order-Detail with id ${id} removed successfully`,
    );
  }
}
