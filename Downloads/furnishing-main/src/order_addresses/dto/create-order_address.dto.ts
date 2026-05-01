import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDate,
} from 'class-validator';

export class CreateOrderAddressDto {
  @IsOptional()
  @Type(() => Number)
  id?: number;

  @ApiProperty({
    description: 'Customer ID',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  readonly customer_id?: number;

  @ApiProperty({
    description: 'Region (State or Province)',
    example: 'New York',
  })
  @IsNotEmpty()
  @IsString()
  readonly region: string;

  @ApiProperty({
    description: 'District (City or Borough within the Region)',
    example: 'Brooklyn',
  })
  @IsNotEmpty()
  @IsString()
  readonly district: string;

  @ApiProperty({
    description: 'Street',
    example: '123 Main St',
  })
  @IsNotEmpty()
  @IsString()
  readonly street: string;

  @ApiProperty({
    description: 'Zip Code',
    example: 11201,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly zip_code: number;

  @ApiProperty({
    description: 'Additional Information',
    example: 'Apartment 4B, near Central Park',
  })
  @IsOptional()
  @IsString()
  readonly additional_info?: string;

  @ApiProperty({
    description: 'Order date and time',
    example: '2025-01-30T14:25:36.000Z',
  })
  @IsNotEmpty()
  @IsDate()
  readonly order_date: Date;
}
