import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsDate,
  IsPositive,
  IsNotEmpty,
} from 'class-validator';
import { PaymentMethod } from '../../common/types/payment_method';
import { PaymentStatus } from '../../common/types/payment_status';
import { Order } from '../../order/entities/order.entity';

export class CreatePaymentDto {
  @ApiProperty({ example: 1, description: 'ID of the related order' })
  @IsNumber()
  @IsPositive()
  orderId: number;

  @ApiProperty({
    example: PaymentMethod.Card,
    enum: PaymentMethod,
    description: 'Payment method used',
  })
  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @ApiProperty({
    example: '2024-01-01T12:00:00Z',
    description: 'Date of payment',
  })
  @IsDate()
  payment_date: Date;

  @ApiProperty({ example: 100.5, description: 'Amount paid' })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    example: PaymentStatus.COMPLETED,
    enum: PaymentStatus,
    description: 'Status of the payment',
  })
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @ApiProperty({ description: 'Order details associated with the payment' })
  @IsNotEmpty()
  order: Order;
}
