import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Query,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CreateProductDetailDto } from './dto/create-productDetail.dto';
import { UpdateProductDetailDto } from './dto/update-productDetail.dto';
import { ProductDetailService } from './productDetail.service';
import { PaginationDto } from 'src/admin/dto/pagination.dto';
import { AdminAccessTokenGuard } from '../common/guards/admin.access-token.guard';

@ApiTags('Product Details')
@Controller('product-detail')
export class ProductDetailController {
  constructor(private readonly productDetailService: ProductDetailService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product detail' })
  @ApiResponse({
    status: 201,
    description: 'Product detail created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @UseGuards(AdminAccessTokenGuard)
  async createProductDetail(
    @Body() createProductDetailDto: CreateProductDetailDto,
  ) {
    return this.productDetailService.create(createProductDetailDto);
  }

  @Get()
  @ApiOperation({
    summary:
      'Retrieve all product details with optional filtering, sorting, and pagination',
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    description: 'Filter by product detail name or description',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Order of sorting',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  @ApiResponse({ status: 200, description: 'List of products' })
  async findAll(@Query() query: PaginationDto) {
    return this.productDetailService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single product detail by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product detail retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'Product detail not found.' })
  async findOne(@Param('id') id: number) {
    return this.productDetailService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product detail by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product detail updated successfully.',
  })
  @ApiResponse({ status: 404, description: 'Product detail not found.' })
  async update(
    @Param('id') id: number,
    @Body() updateProductDetailDto: UpdateProductDetailDto,
  ) {
    return this.productDetailService.update(id, updateProductDetailDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product detail by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product detail deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'Product detail not found.' })
  async remove(@Param('id') id: number) {
    return this.productDetailService.remove(id);
  }
}
