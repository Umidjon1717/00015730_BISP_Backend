import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { createApiResponse } from '../common/utils';
import { PaginationDto } from '../admin/dto/pagination.dto';
import { Customer } from '../customer/entities/customer.entity';
import { OrderDto } from './dto/order.dto';
import { OrderAddressesService } from '../order_addresses/order_addresses.service';
import { OrderDetailService } from '../order_detail/order_detail.service';
import { Product } from '../product/entities/product.entity';
import { CreateOrderAddressDto } from '../order_addresses/dto/create-order_address.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    private readonly orderAddressService: OrderAddressesService,
    private readonly orderDetailService: OrderDetailService,
  ) {}

  async create(orderDto: OrderDto) {
    const { address, customerId, order_details, total_price } = orderDto;

    const customer = await this.customerRepo.findOne({
      where: { id: customerId },
    });
    if (!customer) {
      throw new NotFoundException(`Customer with id ${customerId} not found`);
    }
    let new_address;
    if (address.id) {
      new_address = await this.orderAddressService.findOne(address.id);
    } else {
      new_address = await this.orderAddressService.create({
        ...address,
        customer_id: customerId,
      });
    }

    if (!new_address) {
      throw new BadRequestException('Error on creating address');
    }

    for (const order_detail of order_details) {
      const product = await this.productRepo.findOne({
        where: { id: order_detail.productId },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with id ${order_detail.productId} not found`,
        );
      }

      if (product.stock < order_detail.quantity) {
        throw new BadRequestException(
          `Not enough stock for product: ${product.name} (Available: ${product.stock}, Requested: ${order_detail.quantity})`,
        );
      }
    }

    const order = await this.orderRepo.save({
      customerId,
      orderAddressId: new_address?.id,
      total_price: Number(total_price),
    });

    if (!order) {
      throw new BadRequestException('Error on creating order');
    }

    const new_order_details = await Promise.all(
      order_details.map(async (order_detail) => {
        const product = await this.productRepo.findOne({
          where: { id: order_detail.productId },
        });

        if (!product) {
          throw new NotFoundException(
            `Product with id ${order_detail.productId} not found`,
          );
        }

        if (product.stock < order_detail.quantity) {
          throw new BadRequestException(
            `Not enough stock for product: ${product.name} (Available: ${product.stock}, Requested: ${order_detail.quantity})`,
          );
        }

        product.stock -= order_detail.quantity;
        await this.productRepo.save(product);

        return this.orderDetailService.create({
          ...order_detail,
          orderId: order.id,
        });
      }),
    );

    if (!new_order_details) {
      throw new BadRequestException('Error on creating order details');
    }

    const result = {
      order,
      new_address,
      order_details: new_order_details,
    };

    return createApiResponse(201, 'Order created successfully', { result });
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;
    const calculatedSkip = (page - 1) * limit;
    const total = await this.orderRepo.count();

    const orders = await this.orderRepo.find({
      relations: ['order_address', 'order_details', 'order_details.product'],
      select: {
        order_address: {
          additional_info: true,
          district: true,
          region: true,
          street: true,
          zip_code: true,
        },
        order_details: {
          quantity: true,
          productId: true,
          product: {
            name: true,
            price: true,
          },
        },
      },
      skip: calculatedSkip,
      take: limit,
    });

    return createApiResponse(200, 'List of orders retrieved successfully', {
      orders,
      total,
      limit,
      page,
    });
  }

  async findByCustomerId(customer_id: number) {
    const order = await this.orderRepo.find({
      where: { customerId: customer_id },
      relations: [
        'order_address',
        'order_details',
        'order_details.product',
        'order_details.product.discount',
      ],
      select: {
        order_address: {
          additional_info: true,
          district: true,
          region: true,
          street: true,
          zip_code: true,
        },
        order_details: {
          quantity: true,
          product: {
            images: true,
            averageRating: true,
            description: true,
            stock: true,
            name: true,
            price: true,
            discount: {
              percent: true,
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${customer_id} not found`);
    }

    return createApiResponse(
      200,
      `Order with id ${customer_id} retrieved successfully`,
      { order },
    );
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const existingOrder = await this.orderRepo.findOne({
      where: { id },
    });
    if (!existingOrder) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    await this.orderRepo.update(id, updateOrderDto);
    const updatedOrder = await this.orderRepo.findOne({
      where: { id },
    });

    return createApiResponse(200, 'Order updated successfully', {
      updatedOrder,
    });
  }

  async remove(id: number) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['order_details'],
      select: {
        order_details: {
          productId: true,
          quantity: true,
        },
      },
    });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    await Promise.all(
      order.order_details.map(async (detail) => {
        const product = await this.productRepo.findOne({
          where: { id: detail.productId },
        });
        if (product) {
          product.stock += detail.quantity;
          await this.productRepo.save(product);
        }
      }),
    );

    await this.orderRepo.delete(id);
    return createApiResponse(200, `Order with id ${id} removed successfully`);
  }
}
