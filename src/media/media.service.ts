import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

const ALLOWED_TYPES: Record<string, { mimeTypes: string[]; maxBytes: number }> = {
  USER_AVATAR: { mimeTypes: ['image/'], maxBytes: 10 * 1024 * 1024 },
  TASK_COVER: { mimeTypes: ['image/'], maxBytes: 10 * 1024 * 1024 },
  BRAND_LOGO: { mimeTypes: ['image/'], maxBytes: 10 * 1024 * 1024 },
  PORTFOLIO: { mimeTypes: ['image/', 'video/'], maxBytes: 500 * 1024 * 1024 },
  WORK_SUBMISSION: { mimeTypes: ['image/', 'video/'], maxBytes: 500 * 1024 * 1024 },
  CHAT_ATTACHMENT: { mimeTypes: ['image/', 'video/', 'application/pdf'], maxBytes: 50 * 1024 * 1024 },
};

const FOLDERS: Record<string, string> = {
  USER_AVATAR: 'avatars',
  TASK_COVER: 'tasks',
  BRAND_LOGO: 'logos',
  PORTFOLIO: 'portfolio',
  WORK_SUBMISSION: 'submissions',
  CHAT_ATTACHMENT: 'chat',
};

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

  async upload(type: string, entityId: string, file: Express.Multer.File) {
    const typeConfig = ALLOWED_TYPES[type];
    if (!typeConfig) throw new BadRequestException('Invalid file type');

    const isAllowedMime = typeConfig.mimeTypes.some(m => file.mimetype.startsWith(m));
    if (!isAllowedMime) throw new BadRequestException(`File type ${file.mimetype} not allowed for ${type}`);
    if (file.size > typeConfig.maxBytes) throw new BadRequestException('File too large');

    const folder = `collab/${FOLDERS[type] || type.toLowerCase()}/${entityId}`;
    const isVideo = file.mimetype.startsWith('video/');
    const resourceType: any = isVideo ? 'video' : file.mimetype === 'application/pdf' ? 'raw' : 'image';

    const result = await this.uploadToCloudinary(file.buffer, {
      folder,
      resource_type: resourceType,
      transformation: resourceType !== 'raw'
        ? [{ quality: 'auto', fetch_format: 'auto' }]
        : undefined,
    });

    return {
      fileId: result.public_id,
      objectKey: result.public_id,
      presignedUrl: result.secure_url,
      contentType: file.mimetype,
      sizeBytes: file.size,
    };
  }

  async getPresignedUrl(objectKey: string) {
    return cloudinary.url(objectKey, {
      secure: true,
      resource_type: 'auto',
    });
  }

  private uploadToCloudinary(buffer: Buffer, options: any): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
      Readable.from(buffer).pipe(uploadStream);
    });
  }
}