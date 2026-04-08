import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Repository } from 'typeorm';
import { hash } from 'bcrypt';
import { PaginationDto } from '../admin/dto/pagination.dto';
import { createApiResponse } from '../common/utils';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
  ) {}
  async create(createCustomerDto: CreateCustomerDto) {
    const existsCustomer = await this.customerRepo.findOneBy({
      email: createCustomerDto.email,
    });
    if (existsCustomer) {
      throw new BadRequestException('User already exists');
    }
    if (createCustomerDto.password !== createCustomerDto.confirm_password) {
      throw new BadRequestException('Passwords not match');
    }
    const hashed_password = await hash(createCustomerDto.password, 7);
    const customer = await this.customerRepo.save({
      ...createCustomerDto,
      hashed_password,
    });
    return customer;
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const total = await this.customerRepo.count();
    const calculatedSkip = (page - 1) * limit;
    const customers = await this.customerRepo.find({
      skip: calculatedSkip,
      take: limit,
    });
    return createApiResponse(200, 'List of customers retrieved successfully', {
      customers,
      total,
      limit,
      page,
    });
  }

  async findOne(id: number) {
    const customer = await this.customerRepo.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }
    return createApiResponse(200, 'Customer retrieved successfully', { customer });
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    const existingcustomer = await this.customerRepo.findOne({ where: { id } });
    if (!existingcustomer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }

    await this.customerRepo.update(id, updateCustomerDto);
    const updateCustomer = await this.customerRepo.findOne({ where: { id } });

    return createApiResponse(200, 'Customer updated successfully', {
      updateCustomer,
    });
  }

  async remove(id: number) {
    const customer = await this.customerRepo.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }

    await this.customerRepo.delete(id);
    return createApiResponse(200, 'Customer removed successfully');
  }
}
