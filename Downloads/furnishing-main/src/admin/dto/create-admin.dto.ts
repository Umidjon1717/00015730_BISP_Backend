import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({
    description: 'Admin full name',
    example: 'Salimov Karim',
  })
  @IsString()
  @IsNotEmpty()
  readonly full_name: string;

  @ApiProperty({
    description: 'Admin email address',
    example: 'admin@example.com',
  })
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    description: 'Admin phone number in Uzbekistan format',
    example: '+998901234567',
  })
  @IsPhoneNumber('UZ')
  readonly phone_number: string;

  @ApiProperty({
    description: 'Password for admin account',
    example: 'Strong12',
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
        'Password must include at least 4 characters, 1 uppercase letter, 1 lowercase letter, and 1 number.',
    },
  )
  readonly password: string;

  @ApiProperty({
    description: 'Role name of the role assigned to the admin',
    example: false,
  })
  @ApiProperty({
    description: 'Indicates if the admin is the creator',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly is_creator?: boolean;
}
