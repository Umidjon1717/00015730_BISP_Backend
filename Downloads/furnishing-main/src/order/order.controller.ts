import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Order } from './entities/order.entity';
import { PaginationDto } from '../admin/dto/pagination.dto';
import { OrderDto } from './dto/order.dto';

@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({ summary: 'Create order ' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderDto,
  })
  @Post()
  create(@Body() orderDto: OrderDto) {
    return this.orderService.create(orderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({
    status: 200,
    description: 'List of orders',
    type: [Order],
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.orderService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({
    status: 200,
    description: 'Get order by id retrived successfully',
    type: Order,
  })
  findByCustomerId(@Param('id') customer_id: string) {
    return this.orderService.findByCustomerId(+customer_id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order by ID' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Order updated successfully',
    type: Order,
  })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete order by ID' })
  @ApiResponse({
    status: 200,
    description: 'Removed successfully',
  })
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
