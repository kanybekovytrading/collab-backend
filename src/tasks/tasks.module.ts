import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from '../database/entities/task.entity';
import { BrandProfile } from '../database/entities/brand-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, BrandProfile])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
