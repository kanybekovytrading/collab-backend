import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { Application } from '../database/entities/application.entity';
import { Task } from '../database/entities/task.entity';
import { BloggerProfile } from '../database/entities/blogger-profile.entity';
import { BrandProfile } from '../database/entities/brand-profile.entity';
import { CompletionRecord } from '../database/entities/completion-record.entity';
import { ChatMessage } from '../database/entities/chat-message.entity';
import { PortfolioItem } from '../database/entities/portfolio-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      Task,
      BloggerProfile,
      BrandProfile,
      CompletionRecord,
      ChatMessage,
      PortfolioItem,
    ]),
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
