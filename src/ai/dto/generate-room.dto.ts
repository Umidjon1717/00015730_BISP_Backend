import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class GenerateRoomDto {
  @ApiProperty({ example: 'Living Room' })
  @IsString()
  roomName: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  width: number;

  @ApiProperty({ example: 4 })
  @IsNumber()
  @Min(1)
  length: number;

  @ApiProperty({ example: 'modern minimalist with warm tones', required: false })
  @IsOptional()
  @IsString()
  style?: string;

  @ApiProperty({ example: 2000, required: false })
  @IsOptional()
  @IsNumber()
  budget?: number;
}
