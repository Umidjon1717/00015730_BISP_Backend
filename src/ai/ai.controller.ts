import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';
import { SearchDto } from './dto/search.dto';
import { RecommendDto } from './dto/recommend.dto';
import { RoomStyleDto } from './dto/room-style.dto';
import { GenerateRoomDto } from './dto/generate-room.dto';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Chat with AI furniture assistant' })
  @ApiResponse({ status: 200, description: 'AI assistant response' })
  chat(@Body() chatDto: ChatDto) {
    return this.aiService.chat(chatDto);
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Natural language product search' })
  @ApiResponse({ status: 200, description: 'Matched products' })
  search(@Body() searchDto: SearchDto) {
    return this.aiService.search(searchDto);
  }

  @Post('recommend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get AI product recommendations based on a product' })
  @ApiResponse({ status: 200, description: 'Recommended products' })
  recommend(@Body() recommendDto: RecommendDto) {
    return this.aiService.recommend(recommendDto);
  }

  @Post('room-style')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get furniture suggestions for a room style' })
  @ApiResponse({ status: 200, description: 'Room furniture suggestions' })
  roomStyle(@Body() roomStyleDto: RoomStyleDto) {
    return this.aiService.roomStyle(roomStyleDto);
  }

  @Post('generate-room')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate an AI image of a furnished room' })
  @ApiResponse({ status: 200, description: 'Generated room image URL + selected products' })
  generateRoom(@Body() generateRoomDto: GenerateRoomDto) {
    return this.aiService.generateRoom(generateRoomDto);
  }
}
