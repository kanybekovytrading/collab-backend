import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import { MediaService } from './media.service';
import { apiResponse } from '../common/dto/api-response';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Media')
@Controller('media')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  // ── 1. Presigned URL для прямой загрузки с клиента ───────────────────────
  // Клиент: GET /media/presign → получает uploadUrl → PUT файл на Tigris
  // Railway не участвует в передаче файла
  @Get('presign')
  @ApiOperation({
    summary: 'Получить presigned URL для прямой загрузки на Tigris',
  })
  @ApiQuery({ name: 'type', example: 'PORTFOLIO' })
  @ApiQuery({ name: 'entityId', example: 'user-uuid' })
  @ApiQuery({ name: 'contentType', example: 'video/mp4' })
  @ApiQuery({ name: 'sizeBytes', example: '15000000' })
  async presign(
    @Query('type') type: string,
    @Query('entityId') entityId: string,
    @Query('contentType') contentType: string,
    @Query('sizeBytes') sizeBytes: string,
  ) {
    if (!type) throw new BadRequestException('type is required');
    if (!entityId) throw new BadRequestException('entityId is required');
    if (!contentType) throw new BadRequestException('contentType is required');
    if (!sizeBytes) throw new BadRequestException('sizeBytes is required');

    const result = await this.mediaService.getPresignedUpload(
      type,
      entityId,
      contentType,
      Number(sizeBytes),
    );

    return apiResponse(result);
  }

  // ── 2. Fallback: загрузка через сервер (для небольших файлов / аватаров) ──
  @Post('upload')
  @ApiOperation({ summary: 'Загрузить файл через сервер (fallback)' })
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

  // ── 3. Удалить файл ───────────────────────────────────────────────────────
  @Delete(':fileId')
  @ApiOperation({ summary: 'Удалить файл из хранилища' })
  async delete(@Param('fileId') fileId: string) {
    if (!fileId) throw new BadRequestException('fileId is required');
    await this.mediaService.delete(fileId);
    return apiResponse({ deleted: true });
  }
}
