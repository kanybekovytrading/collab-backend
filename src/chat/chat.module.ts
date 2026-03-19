import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { OnlineStatusService } from './online-status.service';
import { ChatMessage } from '../database/entities/chat-message.entity';
import { Application } from '../database/entities/application.entity';
import { User } from '../database/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage, Application, User]),
    JwtModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, OnlineStatusService],
  exports: [OnlineStatusService],
})
export class ChatModule {}
