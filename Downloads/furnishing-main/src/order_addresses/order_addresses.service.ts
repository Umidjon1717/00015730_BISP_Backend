import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderAddressDto } from './dto/create-order_address.dto';
import { UpdateOrderAddressDto } from './dto/update-order_address.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderAddress } from './entities/order_address.entity';
import { Repository } from 'typeorm';
import { createApiResponse } from '../common/utils';
import { PaginationDto } from '../admin/dto/pagination.dto';

@Injectable()
export class OrderAddressesService {
  constructor(
    @InjectRepository(OrderAddress)
    private readonly orderAddressRepo: Repository<OrderAddress>,
  ) {}
  async create(createOrderAddressDto: CreateOrderAddressDto) {
    const address = this.orderAddressRepo.save(createOrderAddressDto);
    return address;
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const calculatedSkip = (page - 1) * limit;
    const [orderAddresses, total] = await this.orderAddressRepo.findAndCount({
      skip: calculatedSkip,
      take: limit,
    });
    return createApiResponse(
      200,
      'List of order-addresses retrieved successfully',
      { orderAddresses, total, limit, page },
    );
  }

  async findOne(id: number) {
    const orderAddress = await this.orderAddressRepo.findOne({
      where: { id },
    });
    if (!orderAddress) {
      throw new NotFoundException(`Order-Address with id ${id} not found`);
    }
    return orderAddress;
  }
  async findCustomerAddresses(customer_id: number) {
    const orderAddress = await this.orderAddressRepo.find({
      where: { customer_id },
    });
    if (!orderAddress) {
      throw new NotFoundException(
        `Order-Address with customer id ${customer_id} not found`,
      );
    }
    return orderAddress;
  }

  async update(id: number, updateOrderAddressDto: UpdateOrderAddressDto) {
    const existingOrderAddress = await this.orderAddressRepo.findOne({
      where: { id },
    });
    if (!existingOrderAddress) {
      throw new NotFoundException(`Order-Address with id ${id} not found`);
    }

    await this.orderAddressRepo.update(id, updateOrderAddressDto);
    const updatedOrderAddress = await this.orderAddressRepo.findOne({
      where: { id },
    });

    return createApiResponse(200, 'Order-Address updated successfully', {
      updatedOrderAddress,
    });
  }

  async remove(id: number) {
    const orderAddress = await this.orderAddressRepo.findOne({ where: { id } });
    if (!orderAddress) {
      throw new NotFoundException(`Order-Address with id ${id} not found`);
    }

    await this.orderAddressRepo.delete(id);
    return createApiResponse(
      200,
      `Order-Address with id ${id} removed successfully`,
    );
  }
}
