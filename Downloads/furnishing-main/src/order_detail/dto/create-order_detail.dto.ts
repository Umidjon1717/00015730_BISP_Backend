import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDetailDto {
  @ApiProperty({
    description: 'Product ID in the order detail',
    type: Number,
    example: 101,
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({
    description: 'Order ID associated with this order detail',
    type: Number,
    example: 5001,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  orderId: number;

  @ApiProperty({
    description: 'Quantity of the product in the order',
    type: Number,
    example: 3,
  })
  @IsInt()
  @IsNotEmpty()
  quantity: number;
}
