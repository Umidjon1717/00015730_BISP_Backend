import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: "Category's name",
    example: 'Made of wood',
  })
  @IsString()
  readonly name: string;

  @ApiProperty({
    description: 'Description',
    example: 'Produced based on European standards',
  })
  @IsString()
  readonly description: string;
}
