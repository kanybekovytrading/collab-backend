import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../database/entities/user.entity';
import { Task } from '../database/entities/task.entity';
import { Application } from '../database/entities/application.entity';
import { BloggerProfile } from '../database/entities/blogger-profile.entity';
import { BrandProfile } from '../database/entities/brand-profile.entity';
import { CompletionRecord } from '../database/entities/completion-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Task, Application, BloggerProfile, BrandProfile, CompletionRecord])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
