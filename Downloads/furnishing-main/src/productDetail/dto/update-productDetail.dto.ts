import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateProductDetailDto } from './create-productDetail.dto';

export class UpdateProductDetailDto extends PartialType(CreateProductDetailDto) {
  @ApiPropertyOptional({ description: 'Product ID', example: 1 })
  productId?: number;

  @ApiPropertyOptional({ description: 'Width in cm', example: 45.5 })
  withCm?: number;

  @ApiPropertyOptional({ description: 'Height in cm', example: 90.2 })
  heghtCm?: number;

  @ApiPropertyOptional({ description: 'Depth in cm', example: 30.4 })
  depthCm?: number;

  @ApiPropertyOptional({ description: 'Weight in kg', example: 12.5 })
  weightKg?: number;

  @ApiPropertyOptional({ description: 'Seat height in cm', example: 45.0 })
  seatHeightCm?: number;

  @ApiPropertyOptional({ description: 'Leg height in cm', example: 20.0 })
  legHeightCm?: number;

  @ApiPropertyOptional({ description: 'Country of origin', example: 'Italy' })
  countryOrigin?: string;

  @ApiPropertyOptional({ description: 'Array of tags associated with the product', example: [101, 102, 103] })
  tags?: number[];

  @ApiPropertyOptional({ description: 'Capacity of the product', example: 4 })
  capacity?: number;

  @ApiPropertyOptional({ description: 'Warranty period in months', example: 24 })
  warranty?: number;

  @ApiPropertyOptional({ description: 'Maximum load capacity in kg', example: 150 })
  maxLoadCapacity?: number;

  @ApiPropertyOptional({ description: 'Primary material of the product', example: 'Wood' })
  material?: string;

  @ApiPropertyOptional({ description: 'Filling material of the product', example: 'Foam' })
  fillingMaterial?: string;

  @ApiPropertyOptional({ description: 'Upholstery material of the product', example: 'Leather' })
  upholsteryMaterial?: string;
}
