import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { TelegramService } from './telegram/telegram.service';

class ContactDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}

@ApiTags('Root')
@Controller()
export class AppController {
  constructor(private readonly telegramService: TelegramService) {}

  @Get()
  @ApiOperation({ summary: 'API entry (use /api/docs or /api/products)' })
  root() {
    return {
      name: 'Furnishings API',
      docs: '/api/docs',
      products: '/api/products',
    };
  }

  @Post('contact')
  @ApiOperation({ summary: 'Send contact message to Telegram' })
  async contact(@Body() dto: ContactDto) {
    const ok = await this.telegramService.sendContactMessage(dto);
    return {
      statusCode: 200,
      message: ok
        ? 'Contact message sent successfully'
        : 'Contact message accepted',
    };
  }
}
