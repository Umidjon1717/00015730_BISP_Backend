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
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Cart } from './entities/cart.entity';
import { PaginationDto } from '../admin/dto/pagination.dto';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({ summary: 'Post a cart' })
  @ApiResponse({
    status: 201,
    description: 'Cart has been created successfully',
    type: [Cart],
  })
  create(@Body() createCartDto: CreateCartDto) {
    return this.cartService.create(createCartDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all carts' })
  @ApiResponse({
    status: 200,
    description: 'List of carts',
    type: [Cart],
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.cartService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cart by ID' })
  @ApiResponse({
    status: 200,
    description: 'Get cart by ID retrieved successfully',
    type: Cart,
  })
  findOne(@Param('id') id: string) {
    return this.cartService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update cart by ID' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Cart has been updated successfully',
    type: Cart,
  })
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.update(+id, updateCartDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete cart by ID' })
  @ApiResponse({
    status: 200,
    description: 'Cart has been deleted successfully',
  })
  remove(@Param('id') id: string) {
    return this.cartService.remove(+id);
  }
}
