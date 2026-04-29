import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsOrder,
  FindOptionsWhere,
  Like,
  MoreThan,
  Repository,
} from 'typeorm';
import { PaginationDto } from 'src/admin/dto/pagination.dto';
import { createApiResponse } from '../common/utils';
import { Category } from '../category/entities/category.entity';
import { deleteFiles, saveFile } from '../common/helpers/saveImage';
import { Likes } from '../like/entities/like.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private ProductRepo: Repository<Product>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Likes) private likeRepo: Repository<Likes>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createProductDto: CreateProductDto, images: any[]) {
    const category = await this.categoryRepo.findOneBy({
      id: createProductDto.categoryId,
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    const existsProduct = await this.ProductRepo.findOneBy({
      sku: createProductDto.sku,
    });
    if (existsProduct) {
      throw new BadRequestException('Product already exists');
    }

    const fileNames = await Promise.all(
      images.map((image: any) => saveFile(image)),
    );
    const product = await this.ProductRepo.save({
      ...createProductDto,
      images: fileNames,
    });

    return createApiResponse(201, 'Product created successfully', { product });
  }

  async findAll(query: PaginationDto, token: string) {
    const {
      filter,
      order = 'desc',
      page = 1,
      limit = 10,
      priceOrder,
      categoryId,
    } = query;

    const skip = (page - 1) * limit;

    let likedProductIds = [];
    if (token) {
      try {
        const { id } = this.jwtService.decode(token) as { id: string };
        if (id) {
          const likes = await this.likeRepo.find({
            where: { customerId: +id },
          });
          likedProductIds = likes.map((like) => like.productId);
        }
      } catch (error) {}
    }
    const where: FindOptionsWhere<any>[] = [{ stock: MoreThan(0) }];

    if (filter) {
      where.push(
        { name: Like(`%${filter}%`) },
        { description: Like(`%${filter}%`) },
      );
    }

    if (categoryId) {
      where.push({ categoryId });
    }

    const orderBy: FindOptionsOrder<any> = priceOrder
      ? {
          price: priceOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
          createdAt: order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
        }
      : {
          createdAt: order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
        };

    const [products, total] = await this.ProductRepo.findAndCount({
      where: where.length ? where : undefined,
      order: orderBy,
      skip,
      take: limit,
      relations: ['discount'],
      select: {
        discount: {
          percent: true,
        },
      },
    });

    const productsWithLikes = products.map((product) => {
      const discountedPrice = product.discount
        ? product.price - (product.price * product.discount.percent) / 100
        : product.price;

      return {
        ...product,
        price: discountedPrice,
        is_liked: likedProductIds.includes(product.id),
      };
    });

    const totalPages = Math.ceil(total / limit);
    return createApiResponse(200, 'Products retrieved successfully', {
      products: productsWithLikes,
      skip,
      limit,
      total,
      totalPages,
    });
  }

  async findOne(id: number) {
    const product = await this.ProductRepo.findOne({
      where: { id },
      relations: ['reviews', 'discount'],
      select: {
        discount: {
          percent: true,
        },
        reviews: {
          comment: true,
          id: true,
        },
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto, images: any[]) {
    const { tags, colors, ...rest } = updateProductDto;
    const sanitizedDto = {
      ...(tags && tags.length > 0 && { tags }),
      ...(colors && colors.length > 0 && { colors }),
      ...rest,
    };

    await this.ProductRepo.update(id, sanitizedDto);
    const product = await this.ProductRepo.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }

    if (images && images.length > 0) {
      if (product.images && product.images.length > 0) {
        deleteFiles(product.images);
      }

      const fileNames = await Promise.all(
        images.map((image: any) => saveFile(image)),
      );
      product.images = fileNames;
      await this.ProductRepo.save(product);
    }

    return createApiResponse(200, 'Product updated successfully', {
      updatedProduct: product,
    });
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    if (!product) {
      throw new BadRequestException(`Product not found with id ${id}`);
    }
    if (product.images && product.images.length > 0) {
      deleteFiles(product.images);
    }
    await this.ProductRepo.remove(product);
    return createApiResponse(200, 'Product delete successfully');
  }
}
