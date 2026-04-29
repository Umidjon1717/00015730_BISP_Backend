import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class CreateLikeDto {
  @ApiProperty({
    description: 'The ID of the customer who likes the product',
    example: 1,
  })
  @IsInt({ message: 'customerId must be an integer' })
  @IsPositive({ message: 'customerId must be a positive number' })
  readonly customerId: number;

  @ApiProperty({
    description: 'The ID of the product being liked',
    example: 42,
  })
  @IsInt({ message: 'productId must be an integer' })
  @IsPositive({ message: 'productId must be a positive number' })
  readonly productId: number;
}
