import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { OrderAddressesService } from './order_addresses.service';
import { CreateOrderAddressDto } from './dto/create-order_address.dto';
import { UpdateOrderAddressDto } from './dto/update-order_address.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderAddress } from './entities/order_address.entity';
import { PaginationDto } from '../admin/dto/pagination.dto';

@ApiTags('Order Addresses')
@Controller('order-addresses')
export class OrderAddressesController {
  constructor(private readonly orderAddressesService: OrderAddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Post a order-address' })
  @ApiResponse({
    status: 201,
    description: 'Order-Address has been created successfully',
    type: [OrderAddress],
  })
  create(@Body() createOrderAddressDto: CreateOrderAddressDto) {
    return this.orderAddressesService.create(createOrderAddressDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all order-addresses' })
  @ApiResponse({
    status: 200,
    description: 'List of order-addresses',
    type: [OrderAddress],
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.orderAddressesService.findAll(paginationDto);
  }

  @Get(':customer_id')
  @ApiOperation({ summary: 'Get order-address by ID' })
  @ApiResponse({
    status: 200,
    description: 'Get order-address by ID retrieved successfully',
    type: OrderAddress,
  })
  findCustomerAddresses(@Param('customer_id') customer_id: string) {
    return this.orderAddressesService.findCustomerAddresses(+customer_id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order-address by ID' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Order-Address has been updated successfully',
    type: OrderAddress,
  })
  update(
    @Param('id') id: string,
    @Body() updateOrderAddressDto: UpdateOrderAddressDto,
  ) {
    return this.orderAddressesService.update(+id, updateOrderAddressDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete order-address by ID' })
  @ApiResponse({
    status: 200,
    description: 'Order-Address has been deleted successfully',
  })
  remove(@Param('id') id: string) {
    return this.orderAddressesService.remove(+id);
  }
}
