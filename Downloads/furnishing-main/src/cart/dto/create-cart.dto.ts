import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCartDto {
  @ApiProperty({
    description: 'Customer ID',
    example: 1,
  })
  @IsNumber()
  readonly customer_id: number;

  @ApiProperty({
    description: 'Total Price',
    example: 100,
  })
  @IsNumber()
  readonly total_price: number;

  @ApiProperty({
    description: 'Status',
    example: 100,
  })
  @IsBoolean()
  readonly status: boolean;

  @ApiProperty({
    description: 'Time',
    example: 100,
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  time: Date;
}
