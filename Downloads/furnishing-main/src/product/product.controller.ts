import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  UploadedFiles,
  Patch,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { PaginationDto } from 'src/admin/dto/pagination.dto';
import { AdminAccessTokenGuard } from '../common/guards/admin.access-token.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FormDataDto } from './dto/form-data.dto';
import { UpdateFormDto } from './dto/update-form.dto';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiBearerAuth()
  @UseGuards(AdminAccessTokenGuard)
  @ApiOperation({ summary: 'Create a new product with images' })
  @ApiResponse({ status: 201, description: 'Product created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      fileFilter: (req, file, callback) => {
        const allowedTypes = /jpeg|jpg|png|gif|avif|webp/;
        const extname = allowedTypes.test(file.originalname.toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
      },
      limits: { fileSize: 3 * 1024 * 1024 },
    }),
  )
  async createProduct(
    @Body() formDataDto: FormDataDto,
    @UploadedFiles() images: any[],
  ) {
    const tags = formDataDto?.tags ? formDataDto.tags.split(',') : [];
    const colors = formDataDto?.colors ? formDataDto.colors.split(',') : [];

    return await this.productService.create(
      { ...formDataDto, tags, colors },
      images,
    );
  }

  @Get()
  @ApiOperation({
    summary:
      'Retrieve all products with optional filtering, sorting, and pagination',
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    description: 'Filter by product name or description',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Order by product name',
  })
  @ApiQuery({
    name: 'priceOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Order by price',
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
  async findAll(
    @Query() query: PaginationDto,
    @Headers('authorization') authorization?: string,
  ) {
    let token = null;
    if (authorization) {
      token = authorization.replace('Bearer ', '').trim();
    }
    return this.productService.findAll(query, token);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single product by ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async findOne(@Param('id') id: number) {
    return this.productService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAccessTokenGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a product by ID' })
  @ApiResponse({ status: 200, description: 'Product updated successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      fileFilter: (req, file, callback) => {
        const allowedTypes = /jpeg|jpg|png|gif|avif|webp/;
        const extname = allowedTypes.test(file.originalname.toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
      },
      limits: {
        fileSize: 3 * 1024 * 1024,
      },
    }),
  )
  async update(
    @Param('id') id: number,
    @Body() updateFormDto: UpdateFormDto,
    @UploadedFiles() images: any[],
  ) {
    const tags = updateFormDto?.tags ? updateFormDto.tags.split(',') : [];
    const colors = updateFormDto?.colors ? updateFormDto.colors.split(',') : [];
    return this.productService.update(
      id,
      { ...updateFormDto, tags, colors },
      images,
    );
  }

  @ApiBearerAuth()
  @UseGuards(AdminAccessTokenGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product by ID' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async remove(@Param('id') id: number) {
    return this.productService.remove(id);
  }
}
