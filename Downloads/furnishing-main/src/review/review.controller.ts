import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PaginationDto } from '../admin/dto/pagination.dto';
import { CustomerSelfGuard } from '../common/guards/customer.self.guard';

@ApiTags('Reviews')
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(CustomerSelfGuard)
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({
    status: 201,
    type: CreateReviewDto,
    description: 'Review created successfully',
  })
  @Post()
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewService.create(createReviewDto);
  }

  @ApiOperation({ summary: 'Get all reviews with pagination' })
  @ApiQuery({
    type: PaginationDto,
    description: 'Pagination options',
  })
  @ApiResponse({
    status: 200,
    description: 'List of reviews retrieved successfully',
    type: [CreateReviewDto],
  })
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.reviewService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get a single review by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Review ID' })
  @ApiResponse({
    status: 200,
    description: 'Review retrieved successfully',
    type: CreateReviewDto,
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a review by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Review ID' })
  @ApiBody({
    type: UpdateReviewDto,
    description: 'Updated review details',
  })
  @ApiResponse({
    status: 200,
    description: 'Review updated successfully',
    type: CreateReviewDto,
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewService.update(+id, updateReviewDto);
  }

  @ApiOperation({ summary: 'Delete a review by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Review ID' })
  @ApiResponse({
    status: 200,
    description: 'Review removed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewService.remove(+id);
  }
}
