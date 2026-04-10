import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CustomerSignInDto {
  @ApiProperty({
    description: 'Customer email',
    example: 'shoxbek@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    description: 'Customer password',
    example: 'Qodir12',
  })
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
