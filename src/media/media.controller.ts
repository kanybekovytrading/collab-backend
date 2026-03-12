import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { createHmac } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { MediaService } from './media.service';
import { apiResponse } from '../common/dto/api-response';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(
    private mediaService: MediaService,
    private cfg: ConfigService,
  ) {}

  @Post('upload')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Загрузить файл' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Query('type') type: string,
    @Query('entityId') entityId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!type) throw new BadRequestException('type is required');
    if (!entityId) throw new BadRequestException('entityId is required');
    if (!file) throw new BadRequestException('file is required');

    return apiResponse(await this.mediaService.upload(type, entityId, file));
  }

  @Get('signed-url')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить подписанную ссылку на файл' })
  signedUrl(
    @Query('fileId') fileId: string,
    @Query('resourceType') resourceType: 'image' | 'video' = 'image',
  ) {
    if (!fileId) throw new BadRequestException('fileId is required');
    return apiResponse(this.mediaService.getSignedUrl(fileId, resourceType));
  }

  // Добавить в MediaController (media.controller.ts)

  @Get('sign')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Получить подпись для прямой загрузки на Cloudinary',
  })
  getUploadSignature(
    @Query('type') type: string,
    @Query('entityId') entityId: string,
  ) {
    if (!type) throw new BadRequestException('type is required');
    if (!entityId) throw new BadRequestException('entityId is required');
    return apiResponse(this.mediaService.getUploadSignature(type, entityId));
  }

  /**
   * Webhook от Cloudinary — вызывается когда HLS готов.
   * Настроить в дашборде: Settings → Notifications → добавить URL
   * https://yourdomain.com/media/webhook
   */
  @Post('webhook')
  @ApiExcludeEndpoint()
  cloudinaryWebhook(
    @Body() body: any,
    @Headers('x-cld-signature') signature: string,
    @Headers('x-cld-timestamp') timestamp: string,
  ) {
    this.verifyWebhookSignature(JSON.stringify(body), timestamp, signature);

    if (body.notification_type === 'eager' && body.public_id) {
      const data = this.mediaService.handleVideoReady(body.public_id);

      // TODO: обновить статус в БД
      // await this.videoRepository.update(
      //   { fileId: data.fileId },
      //   { hlsUrl: data.hlsUrl, status: 'ready' },
      // );

      console.log(`Video ready: ${data.fileId} → ${data.hlsUrl}`);
    }

    return { received: true };
  }

  private verifyWebhookSignature(
    body: string,
    timestamp: string,
    signature: string,
  ) {
    const apiSecret = this.cfg.get<string>('CLOUDINARY_API_SECRET');
    const expected = createHmac('sha256', apiSecret)
      .update(body + timestamp)
      .digest('hex');

    if (expected !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    // Защита от replay-атак — не старше 5 минут
    const age = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10);
    if (age > 300) {
      throw new BadRequestException('Webhook timestamp expired');
    }
  }
}
