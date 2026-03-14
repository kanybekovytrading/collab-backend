// chat.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';
import { apiResponse } from '../common/dto/api-response';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chats')
export class ChatController {
  constructor(private chatService: ChatService) {}

  // ── Список всех чатов пользователя ─────────────────────────────────────
  @Get('my')
  @ApiOperation({ summary: 'Список моих чатов (как Instagram Direct)' })
  async getMyChats(@CurrentUser() user: User) {
    return apiResponse(await this.chatService.getMyChats(user.id));
  }

  @Get(':appId/messages')
  @ApiOperation({ summary: 'История сообщений чата' })
  async getMessages(
    @CurrentUser() user: User,
    @Param('appId', ParseUUIDPipe) appId: string,
    @Query('page') page = 0,
    @Query('size') size = 50,
  ) {
    return apiResponse(
      await this.chatService.getMessages(appId, user.id, +page, +size),
    );
  }

  @Post(':appId/messages')
  @ApiOperation({ summary: 'Отправить сообщение (REST fallback)' })
  async send(
    @CurrentUser() user: User,
    @Param('appId', ParseUUIDPipe) appId: string,
    @Body() dto: any,
  ) {
    return apiResponse(await this.chatService.sendMessage(appId, user, dto));
  }
}
