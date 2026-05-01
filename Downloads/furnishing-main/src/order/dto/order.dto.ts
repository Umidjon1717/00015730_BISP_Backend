import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { CreateOrderAddressDto } from '../../order_addresses/dto/create-order_address.dto';
import { CreateOrderDetailDto } from '../../order_detail/dto/create-order_detail.dto';

export class OrderDto {
  @ApiProperty({
    description: 'Customer ID who is placing the order',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  customerId: number;

  @ApiProperty({
    description: 'Address of the customer',
    type: CreateOrderAddressDto,
  })
  @IsNotEmpty()
  address: CreateOrderAddressDto;

  @ApiProperty({
    description: 'Order details (product, quantity, etc.)',
    type: CreateOrderDetailDto,
    isArray: true,
  })
  @IsNotEmpty()
  order_details: CreateOrderDetailDto[];

  @ApiProperty({
    description: 'Total price of the order',
    example: 150.75,
  })
  @IsNumber()
  readonly total_price: number;
}
