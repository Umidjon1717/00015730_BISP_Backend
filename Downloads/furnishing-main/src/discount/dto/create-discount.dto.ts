import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateDiscountDto {
  @ApiProperty({
    description: 'Name',
    example: 'Loyel customer',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Discount's percent",
    example: 40,
  })
  @IsNumber()
  @IsNotEmpty()
  percent: number;

  @ApiProperty({
    description: "Product's ID",
    example: 5,
  })
  @IsNumber()
  @IsNotEmpty()
  product_id: number;

  @ApiProperty({
    description: 'Discount active or not',
    example: true,
  })
  @IsBoolean()
  is_active: boolean;
}
