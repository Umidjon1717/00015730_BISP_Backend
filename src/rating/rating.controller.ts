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
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Rating } from './entities/rating.entity';
import { PaginationDto } from '../admin/dto/pagination.dto';
import { AdminAccessTokenGuard } from '../common/guards/admin.access-token.guard';

@ApiTags('Rating')
@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  // @UseGuards(AdminAccessTokenGuard)
  @Post()
  @ApiOperation({ summary: 'Post a rating' })
  @ApiResponse({
    status: 201,
    description: 'Rating has been created successfully',
    type: [Rating],
  })
  create(@Body() createRatingDto: CreateRatingDto) {
    return this.ratingService.create(createRatingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ratings' })
  @ApiResponse({
    status: 200,
    description: 'List of ratings',
    type: [Rating],
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.ratingService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get rating by ID' })
  @ApiResponse({
    status: 200,
    description: 'Get rating by ID retrieved successfully',
    type: Rating,
  })
  findOne(@Param('id') id: string) {
    return this.ratingService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update rating by ID' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Rating has been updated successfully',
    type: Rating,
  })
  update(@Param('id') id: string, @Body() updateRatingDto: UpdateRatingDto) {
    return this.ratingService.update(+id, updateRatingDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete rating by ID' })
  @ApiResponse({
    status: 200,
    description: 'Rating has been deleted successfully',
  })
  remove(@Param('id') id: string) {
    return this.ratingService.remove(+id);
  }
}
