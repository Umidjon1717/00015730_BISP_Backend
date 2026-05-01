import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { Repository } from 'typeorm';
import { hash } from 'bcrypt';
import { createApiResponse } from '../common/utils';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin) private readonly adminRepo: Repository<Admin>,
  ) {}
  async create(createAdminDto: CreateAdminDto) {
    const existsAdmin = await this.adminRepo.findOne({
      where: {
        email: createAdminDto.email,
      },
    });
    if (existsAdmin) {
      throw new NotFoundException('Admin already exists');
    }

    const hashed_password = await hash(createAdminDto.password, 7);
    const newAdmin = await this.adminRepo.save({
      ...createAdminDto,
      hashed_password,
    });
    if (!newAdmin) {
      throw new ForbiddenException('Error on creating Admin');
    }
    return newAdmin;
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const total = await this.adminRepo.count();
    
    const calculatedSkip = (page - 1) * limit;    
    const admins = await this.adminRepo.find({
      skip: calculatedSkip,
      take: limit,
    });
    return createApiResponse(200, 'List of admins retrieved successfully', {
      admins,
      total,
      limit,
      page,
    });
  }

  

  async findOne(id: number) {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException(`Admin with id ${id} not found`);
    }
    return createApiResponse(200, 'Admin retrieved successfully', { admin });
  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
    const existingAdmin = await this.adminRepo.findOne({ where: { id } });
    if (!existingAdmin) {
      throw new NotFoundException(`Admin with id ${id} not found`);
    }

    await this.adminRepo.update(id, updateAdminDto);
    const updatedAdmin = await this.adminRepo.findOne({ where: { id } });

    return createApiResponse(200, 'Admin updated successfully', {
      updatedAdmin,
    });
  }

  async remove(id: number) {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException(`Admin with id ${id} not found`);
    }

    await this.adminRepo.delete(id);
    return createApiResponse(200, 'Admin removed successfully');
  }
}
