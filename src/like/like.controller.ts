import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Like')
@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @ApiOperation({ summary: 'Toggle like for a product' })
  @ApiResponse({
    status: 201,
    description: 'Like toggled successfully.',
    type: CreateLikeDto,
  })
  @Post()
  create(@Body() createLikeDto: CreateLikeDto) {
    return this.likeService.toggleLike(createLikeDto);
  }

  @ApiOperation({ summary: 'Get likes for a specific product' })
  @ApiResponse({
    status: 200,
    description: 'List of likes for the product.',
  })
  @ApiParam({
    name: 'product_id',
    description: 'ID of the product',
    example: 42,
  })
  @Get('/customer/:customer_id')
  findProductLike(@Param('customer_id') customer_id: string) {
    return this.likeService.getProductLikes(+customer_id);
  }

  @Post('/wishlist/:customerId')
  @ApiResponse({ status: 201, description: 'Wishlist successfully updated.' })
  @ApiResponse({ status: 404, description: 'Customer not found.' })
  async saveWishlist(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Body() wishlist: number[],
  ) {
    return this.likeService.saveWishList(customerId, wishlist);
  }
}
