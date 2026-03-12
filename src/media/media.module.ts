import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { memoryStorage } from 'multer';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { User } from '../database/entities/user.entity';

@Module({
  imports: [
    MulterModule.register({ storage: memoryStorage() }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
