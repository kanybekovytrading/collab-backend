import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Review } from '../database/entities/review.entity';
import { Application } from '../database/entities/application.entity';
import { CompletionRecord } from '../database/entities/completion-record.entity';
import { BloggerProfile } from '../database/entities/blogger-profile.entity';
import { BrandProfile } from '../database/entities/brand-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Application, CompletionRecord, BloggerProfile, BrandProfile])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
