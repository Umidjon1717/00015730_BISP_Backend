import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class RoomStyleDto {
  @ApiProperty({ example: 'modern minimalist living room with white walls' })
  @IsString()
  description: string;

  @ApiProperty({ example: 1500, required: false })
  @IsOptional()
  @IsNumber()
  budget?: number;
}
