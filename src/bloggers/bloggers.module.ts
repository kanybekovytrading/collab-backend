import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BloggersController } from './bloggers.controller';
import { BloggersService } from './bloggers.service';
import { BloggerProfile } from '../database/entities/blogger-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BloggerProfile])],
  controllers: [BloggersController],
  providers: [BloggersService],
  exports: [BloggersService],
})
export class BloggersModule {}
