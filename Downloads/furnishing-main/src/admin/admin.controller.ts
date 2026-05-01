import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Admin } from './entities/admin.entity';
import { AdminAccessTokenGuard } from '../common/guards/admin.access-token.guard';
import { IsCreatorGuard } from '../common/guards/creator.guard';
import { AdminSelfGuard } from '../common/guards/admin.self.guard';
import { PaginationDto } from './dto/pagination.dto';

// @UseGuards(AdminAccessTokenGuard)
@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // @Post()
  // create(@Body() createAdminDto: CreateAdminDto) {
  //   return this.adminService.create(createAdminDto);
  // }

  @ApiBearerAuth()
  @UseGuards(AdminAccessTokenGuard)
  @Get()
  @ApiOperation({ summary: 'Get all admins' })
  @ApiResponse({
    status: 200,
    description: 'List of admins',
    type: [Admin],
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.adminService.findAll(paginationDto);
  }

  @ApiBearerAuth()
  @UseGuards(AdminSelfGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get admin by ID' })
  @ApiResponse({
    status: 200,
    description: 'Get admin by id retrived successfully',
    type: Admin,
  })
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(+id);
  }

  @ApiBearerAuth()
  @UseGuards(AdminSelfGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update admin by ID' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Updated successfully',
    type: Admin,
  })
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.update(+id, updateAdminDto);
  }

  @ApiBearerAuth()
  @UseGuards(IsCreatorGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete admin by ID' })
  @ApiResponse({
    status: 200,
    description: 'Removed successfully',
  })
  remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }
}
