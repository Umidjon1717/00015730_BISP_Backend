import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateCartDetailDto {
  @ApiProperty({
    description: 'Cart ID',
    example: 1,
  })
  @IsNumber()
  readonly cart_id: number;

  @ApiProperty({
    description: 'Product ID',
    example: 1,
  })
  @IsNumber()
  readonly product_id: number;

  @ApiProperty({
    description: 'Quantity',
    example: 100,
  })
  @IsNumber()
  readonly quantity: number;
}
