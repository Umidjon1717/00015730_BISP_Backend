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
import { CartDetailService } from './cart_detail.service';
import { CreateCartDetailDto } from './dto/create-cart_detail.dto';
import { UpdateCartDetailDto } from './dto/update-cart_detail.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CartDetail } from './entities/cart_detail.entity';
import { PaginationDto } from '../admin/dto/pagination.dto';

@ApiTags('Cart-Detail')
@Controller('cart-detail')
export class CartDetailController {
  constructor(private readonly cartDetailService: CartDetailService) {}

  @Post()
  @ApiOperation({ summary: 'Post a cart-detail' })
  @ApiResponse({
    status: 201,
    description: 'Cart-Detail has been created successfully',
    type: [CartDetail],
  })
  create(@Body() createCartDetailDto: CreateCartDetailDto) {
    return this.cartDetailService.create(createCartDetailDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all cart-details' })
  @ApiResponse({
    status: 200,
    description: 'List of cart-details',
    type: [CartDetail],
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.cartDetailService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cart-detail by ID' })
  @ApiResponse({
    status: 200,
    description: 'Get cart-detail by ID retrieved successfully',
    type: CartDetail,
  })
  findOne(@Param('id') id: string) {
    return this.cartDetailService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update cart-detail by ID' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Cart-Detail has been updated successfully',
    type: CartDetail,
  })
  update(
    @Param('id') id: string,
    @Body() updateCartDetailDto: UpdateCartDetailDto,
  ) {
    return this.cartDetailService.update(+id, updateCartDetailDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete cart-detail by ID' })
  @ApiResponse({
    status: 200,
    description: 'Cart-Detail has been deleted successfully',
  })
  remove(@Param('id') id: string) {
    return this.cartDetailService.remove(+id);
  }
}
