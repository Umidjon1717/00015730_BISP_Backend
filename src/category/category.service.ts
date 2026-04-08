import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { createApiResponse } from '../common/utils';
import { PaginationDto } from '../admin/dto/pagination.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto) {
    const existsCategory = await this.categoryRepo.findOne({
      where: { name: createCategoryDto.name },
    });
    if (existsCategory) {
      throw new BadRequestException('Category already exists');
    }
    const newCategory = this.categoryRepo.create(createCategoryDto);
    await this.categoryRepo.save(newCategory);
    return createApiResponse(201, 'Category created successfully', {
      newCategory,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const total = await this.categoryRepo.count();
    const calculatedSkip = (page - 1) * limit;
    const categorys = await this.categoryRepo.find({
      relations: [],
      skip: calculatedSkip,
      take: limit,
    });
    return createApiResponse(200, 'List of categorys retrieved successfully', {
      categorys,
      total,
      limit,
      page,
    });
  }

  async findOne(id: number) {
    const category = await this.categoryRepo.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return createApiResponse(
      200,
      `Category with id ${id} retrieved successfully`,
      { category },
    );
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const existingCategory = await this.categoryRepo.findOne({ where: { id } });
    if (!existingCategory) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    await this.categoryRepo.update(id, updateCategoryDto);
    const updatedCategory = await this.categoryRepo.findOne({ where: { id } });

    return createApiResponse(200, 'Category updated successfully', {
      updatedCategory,
    });
  }

  async remove(id: number) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    await this.categoryRepo.delete(id);
    return createApiResponse(
      200,
      `Category with id ${id} removed successfully`,
    );
  }
}
