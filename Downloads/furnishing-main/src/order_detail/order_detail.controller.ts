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
import { OrderDetailService } from './order_detail.service';
import { CreateOrderDetailDto } from './dto/create-order_detail.dto';
import { UpdateOrderDetailDto } from './dto/update-order_detail.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderDetail } from './entities/order_detail.entity';
import { PaginationDto } from '../admin/dto/pagination.dto';

@ApiTags('OrderDetail')
@Controller('order-detail')
export class OrderDetailController {
  constructor(private readonly orderDetailService: OrderDetailService) {}

  @Post()
  create(@Body() createOrderDetailDto: CreateOrderDetailDto) {
    return this.orderDetailService.create(createOrderDetailDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all order details' })
  @ApiResponse({
    status: 200,
    description: 'List of order details',
    type: [OrderDetail],
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.orderDetailService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order detail by ID' })
  @ApiResponse({
    status: 200,
    description: 'Get order detail by id retrived successfully',
    type: OrderDetail,
  })
  findOne(@Param('id') id: string) {
    return this.orderDetailService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order detail by ID' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Order detail updated successfully',
    type: OrderDetail,
  })
  update(
    @Param('id') id: string,
    @Body() updateOrderDetailDto: UpdateOrderDetailDto,
  ) {
    return this.orderDetailService.update(+id, updateOrderDetailDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete order detail by ID' })
  @ApiResponse({
    status: 200,
    description: 'Removed order detail successfully',
  })
  remove(@Param('id') id: string) {
    return this.orderDetailService.remove(+id);
  }
}
