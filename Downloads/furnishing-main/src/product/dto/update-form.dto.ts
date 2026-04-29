import { PartialType } from '@nestjs/swagger';
import { FormDataDto } from './form-data.dto';

export class UpdateFormDto extends PartialType(FormDataDto) {}
