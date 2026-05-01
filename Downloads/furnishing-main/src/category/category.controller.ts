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
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Category } from './entities/category.entity';
import { PaginationDto } from '../admin/dto/pagination.dto';
import { AdminAccessTokenGuard } from '../common/guards/admin.access-token.guard';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiBearerAuth()
  @UseGuards(AdminAccessTokenGuard)
  @Post()
  @ApiOperation({ summary: 'Post a category' })
  @ApiResponse({
    status: 201,
    description: 'Category has been created successfully',
    type: [Category],
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categorys' })
  @ApiResponse({
    status: 200,
    description: 'List of categorys',
    type: [Category],
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.categoryService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Get category by ID retrieved successfully',
    type: Category,
  })
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAccessTokenGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update category by ID' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Category has been updated successfully',
    type: Category,
  })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAccessTokenGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Category has been deleted successfully',
  })
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
