import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Otp code',
    example: '1025',
  })
  @IsString()
  otp: string;

  @ApiProperty({
    description: 'Client Email',
    example: 'shoxbek@gmail.com',
  })
  @IsEmail()
  readonly email: string;
}