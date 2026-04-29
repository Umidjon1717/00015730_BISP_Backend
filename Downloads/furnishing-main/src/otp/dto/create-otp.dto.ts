import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateOtpDto {
  @ApiProperty({
    description: 'Client Email',
    example: 'shoxbek@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
}
