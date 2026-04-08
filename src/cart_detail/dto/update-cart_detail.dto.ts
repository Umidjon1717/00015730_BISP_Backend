import { PartialType } from '@nestjs/swagger';
import { CreateCartDetailDto } from './create-cart_detail.dto';

export class UpdateCartDetailDto extends PartialType(CreateCartDetailDto) {}
