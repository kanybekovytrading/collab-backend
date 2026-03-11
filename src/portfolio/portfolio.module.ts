import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { PortfolioItem } from '../database/entities/portfolio-item.entity';
import { BloggerProfile } from '../database/entities/blogger-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PortfolioItem, BloggerProfile])],
  controllers: [PortfolioController],
  providers: [PortfolioService],
})
export class PortfolioModule {}
