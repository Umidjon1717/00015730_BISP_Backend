import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateRatingDto {
  @ApiProperty({
    description: "Product's rating",
    example: 4.4,
  })
  @IsNumber()
  readonly rating: number;

  @ApiProperty({
    description: "Product's ID",
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  readonly product_id: number;

  @ApiProperty({
    description: "Customer's ID",
    example: 3,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  readonly customer_id: number;
}
