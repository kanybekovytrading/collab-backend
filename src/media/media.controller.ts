import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { apiResponse } from '../common/dto/api-response';

@ApiTags('Media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Загрузить файл' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Query('type') type: string,
    @Query('entityId') entityId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return apiResponse(await this.mediaService.upload(type, entityId, file));
  }

  @Get('presigned')
  @ApiOperation({ summary: 'Получить свежую ссылку на файл' })
  async presigned(@Query('objectKey') objectKey: string) {
    return apiResponse(await this.mediaService.getPresignedUrl(objectKey));
  }
}
