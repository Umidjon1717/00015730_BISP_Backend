import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
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
  @IsStrongPassword(
    {
      minLength: 4,
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    },
    {
      message:
        'Password must include at least one lowercase letter, one uppercase letter, one number. example: Uzb1',
    },
  )
  readonly password: string;
}
