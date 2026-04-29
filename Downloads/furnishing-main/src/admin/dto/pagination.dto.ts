import { Type } from 'class-transformer';
import { IsOptional, IsString, IsIn, IsNumber } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsString()
  readonly filter?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  readonly order?: 'asc' | 'desc';

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly limit?: number = 10;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  readonly priceOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly categoryId: number;
}
