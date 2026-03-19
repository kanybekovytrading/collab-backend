// chat.controller.ts
import {
  Body,
  Controller,
  Get,
  Inject,
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
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chats')
export class ChatController {
  constructor(
    private chatService: ChatService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  @Get('my')
  @ApiOperation({ summary: 'Список моих чатов (как Instagram Direct)' })
  async getMyChats(@CurrentUser() user: User) {
    return apiResponse(await this.chatService.getMyChats(user.id));
  }

  @Get('users/:userId/status')
  @ApiOperation({ summary: 'Онлайн статус пользователя' })
  async getUserStatus(@Param('userId') userId: string) {
    const online = await this.cacheManager.get(`online:${userId}`);
    const user = await this.userRepo.findOne({ where: { id: userId } });
    return apiResponse({
      online: !!online,
      lastSeenAt: user?.lastSeenAt ?? null,
    });
  }

  @Get(':appId/messages')
  @ApiOperation({ summary: 'История сообщений чата' })
  async getMessages(
    @CurrentUser() user: User,
    @Param('appId', ParseUUIDPipe) appId: string,
    @Query('page') page = 0,
    @Query('size') size = 30,
    @Query('before') before?: string,
  ) {
    return apiResponse(
      await this.chatService.getMessages(appId, user.id, +page, +size, before),
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
