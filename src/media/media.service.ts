import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

const ALLOWED_TYPES: Record<string, { mimeTypes: string[]; maxBytes: number }> =
  {
    USER_AVATAR: { mimeTypes: ['image/'], maxBytes: 10 * 1024 * 1024 },
    TASK_COVER: { mimeTypes: ['image/'], maxBytes: 10 * 1024 * 1024 },
    BRAND_LOGO: { mimeTypes: ['image/'], maxBytes: 10 * 1024 * 1024 },
    PORTFOLIO: { mimeTypes: ['image/', 'video/'], maxBytes: 500 * 1024 * 1024 },
    WORK_SUBMISSION: {
      mimeTypes: ['image/', 'video/'],
      maxBytes: 500 * 1024 * 1024,
    },
    CHAT_ATTACHMENT: {
      mimeTypes: ['image/', 'video/'],
      maxBytes: 50 * 1024 * 1024,
    },
  };

const FOLDERS: Record<string, string> = {
  USER_AVATAR: 'avatars',
  TASK_COVER: 'tasks',
  BRAND_LOGO: 'logos',
  PORTFOLIO: 'portfolio',
  WORK_SUBMISSION: 'submissions',
  CHAT_ATTACHMENT: 'chat',
};

export interface UploadResult {
  fileId: string;
  url: string;
  hlsUrl: string | null;
  status: 'ready' | 'processing';
  contentType: string;
  sizeBytes: number;
}

@Injectable()
export class MediaService {
  constructor(private cfg: ConfigService) {
    cloudinary.config({
      cloud_name: cfg.get('CLOUDINARY_CLOUD_NAME'),
      api_key: cfg.get('CLOUDINARY_API_KEY'),
      api_secret: cfg.get('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  }

  async upload(
    type: string,
    entityId: string,
    file: Express.Multer.File,
  ): Promise<UploadResult> {
    const typeConfig = ALLOWED_TYPES[type];
    if (!typeConfig) throw new BadRequestException('Invalid upload type');

    const isAllowedMime = typeConfig.mimeTypes.some((m) =>
      file.mimetype.startsWith(m),
    );
    if (!isAllowedMime)
      throw new BadRequestException(
        `File type ${file.mimetype} not allowed for ${type}`,
      );
    if (file.size > typeConfig.maxBytes)
      throw new BadRequestException('File too large');

    const folder = `collab/${FOLDERS[type] || type.toLowerCase()}/${entityId}`;
    const isVideo = file.mimetype.startsWith('video/');
    const resourceType: 'video' | 'image' = isVideo ? 'video' : 'image';

    const result = await this.uploadToCloudinary(file.buffer, {
      folder,
      resource_type: resourceType,
      ...(isVideo && {
        eager: [{ streaming_profile: 'full_hd', format: 'm3u8' }],
        eager_async: true,
        eager_notification_url: this.cfg.get('CLOUDINARY_WEBHOOK_URL'),
      }),
      ...(!isVideo && {
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      }),
    });

    return {
      fileId: result.public_id,
      url: result.secure_url,
      hlsUrl: null,
      status: isVideo ? 'processing' : 'ready',
      contentType: file.mimetype,
      sizeBytes: file.size,
    };
  }

  /**
   * Генерирует подпись для прямой загрузки с фронта на Cloudinary.
   * Фронт получает подпись и загружает файл напрямую — минуя Railway.
   */
  getUploadSignature(type: string, entityId: string) {
    const typeConfig = ALLOWED_TYPES[type];
    if (!typeConfig) throw new BadRequestException('Invalid upload type');

    const folder = `collab/${FOLDERS[type] || type.toLowerCase()}/${entityId}`;
    const timestamp = Math.floor(Date.now() / 1000);
    const mightBeVideo = ['PORTFOLIO', 'WORK_SUBMISSION'].includes(type);

    const paramsToSign: Record<string, any> = {
      folder,
      timestamp,
      ...(mightBeVideo && {
        eager: 'sp_full_hd/m3u8',
        eager_async: 'true',
        eager_notification_url: this.cfg.get('CLOUDINARY_WEBHOOK_URL') ?? '',
      }),
    };

    // Cloudinary SDK сам правильно сортирует параметры и генерирует подпись
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      this.cfg.get('CLOUDINARY_API_SECRET'),
    );

    return {
      signature,
      timestamp,
      apiKey: this.cfg.get('CLOUDINARY_API_KEY'),
      cloudName: this.cfg.get('CLOUDINARY_CLOUD_NAME'),
      folder,
      eager: mightBeVideo ? 'sp_full_hd/m3u8' : undefined,
      eagerAsync: mightBeVideo ? true : undefined,
      eagerNotificationUrl: mightBeVideo
        ? this.cfg.get('CLOUDINARY_WEBHOOK_URL')
        : undefined,
    };
  }

  handleVideoReady(publicId: string): { fileId: string; hlsUrl: string } {
    const hlsUrl = cloudinary.url(publicId, {
      resource_type: 'video',
      secure: true,
      streaming_profile: 'full_hd',
      format: 'm3u8',
    });
    return { fileId: publicId, hlsUrl };
  }

  getSignedUrl(publicId: string, resourceType: 'image' | 'video' = 'image') {
    return cloudinary.url(publicId, {
      secure: true,
      resource_type: resourceType,
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });
  }

  private uploadToCloudinary(
    buffer: Buffer,
    options: any,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      Readable.from(buffer).pipe(uploadStream);
    });
  }
}
