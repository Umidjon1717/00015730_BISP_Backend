import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SearchDto {
  @ApiProperty({ example: 'comfortable sofa under 500 dollars in grey' })
  @IsString()
  query: string;
}
