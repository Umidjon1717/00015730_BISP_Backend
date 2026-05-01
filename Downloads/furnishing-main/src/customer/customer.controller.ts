import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationDto } from '../admin/dto/pagination.dto';
import { Customer } from './entities/customer.entity';
import { AdminAccessTokenGuard } from '../common/guards/admin.access-token.guard';
import { CustomerSelfGuard } from '../common/guards/customer.self.guard';

@ApiBearerAuth()
@ApiTags('Customer')
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @UseGuards(AdminAccessTokenGuard)
  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({
    status: 200,
    description: 'List of customers',
    type: [Customer],
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.customerService.findAll(paginationDto);
  }

  @UseGuards(CustomerSelfGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiResponse({
    status: 200,
    description: 'Get customer by id retrived successfully',
    type: Customer,
  })
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(+id);
  }

  @UseGuards(CustomerSelfGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update customer by ID' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Customer updated successfully',
    type: Customer,
  })
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(+id, updateCustomerDto);
  }

  @UseGuards(AdminAccessTokenGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete customer by ID' })
  @ApiResponse({
    status: 200,
    description: 'Customer removed successfully',
  })
  remove(@Param('id') id: string) {
    return this.customerService.remove(+id);
  }
}
