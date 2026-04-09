import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Root')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'API entry (use /api/docs or /api/products)' })
  root() {
    return {
      name: 'Furnishings API',
      docs: '/api/docs',
      products: '/api/products',
    };
  }
}
