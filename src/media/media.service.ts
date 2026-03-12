import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../database/entities/user.entity';

const ALLOWED_TYPES: Record<string, { mimeTypes: string[]; maxBytes: number }> = {
  USER_AVATAR: { mimeTypes: ['image/'], maxBytes: 10 * 1024 * 1024 },
  TASK_COVER: { mimeTypes: ['image/'], maxBytes: 10 * 1024 * 1024 },
  BRAND_LOGO: { mimeTypes: ['image/'], maxBytes: 10 * 1024 * 1024 },
  PORTFOLIO: { mimeTypes: ['image/', 'video/'], maxBytes: 500 * 1024 * 1024 },
  WORK_SUBMISSION: { mimeTypes: ['image/', 'video/'], maxBytes: 500 * 1024 * 1024 },
  CHAT_ATTACHMENT: { mimeTypes: ['image/', 'video/', 'application/pdf'], maxBytes: 50 * 1024 * 1024 },
};

const KEY_PREFIXES: Record<string, string> = {
  USER_AVATAR: 'avatars',
  TASK_COVER: 'tasks',
  BRAND_LOGO: 'logos',
  PORTFOLIO: 'portfolio',
  WORK_SUBMISSION: 'submissions',
  CHAT_ATTACHMENT: 'chat',
};

@Injectable()
export class MediaService {
  private s3: S3Client;
  private bucket: string;

  constructor(
    cfg: ConfigService,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {
    this.bucket = cfg.get('MINIO_BUCKET', 'collab');
    this.s3 = new S3Client({
      endpoint: cfg.get('MINIO_ENDPOINT', 'http://localhost:9000'),
      region: cfg.get('MINIO_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: cfg.get('MINIO_ACCESS_KEY', 'minioadmin'),
        secretAccessKey: cfg.get('MINIO_SECRET_KEY', 'minioadmin'),
      },
      forcePathStyle: true,
    });
  }

  async upload(type: string, entityId: string, file: Express.Multer.File) {
    const typeConfig = ALLOWED_TYPES[type];
    if (!typeConfig) throw new BadRequestException('Invalid file type');

    const isAllowedMime = typeConfig.mimeTypes.some(m => file.mimetype.startsWith(m));
    if (!isAllowedMime) throw new BadRequestException(`File type ${file.mimetype} not allowed for ${type}`);
    if (file.size > typeConfig.maxBytes) throw new BadRequestException('File too large');

    const ext = file.originalname.split('.').pop();
    const fileId = uuidv4();
    const prefix = KEY_PREFIXES[type] || type.toLowerCase();
    const objectKey = `${prefix}/${entityId}/${fileId}.${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const presignedUrl = await getSignedUrl(
      this.s3,
      new GetObjectCommand({ Bucket: this.bucket, Key: objectKey }),
      { expiresIn: 604800 }, // 7 days
    );

    if (type === 'USER_AVATAR' || type === 'BRAND_LOGO') {
      await this.userRepo.update(entityId, { avatarUrl: presignedUrl });
    }

    return {
      fileId,
      objectKey,
      url: presignedUrl,
      contentType: file.mimetype,
      sizeBytes: file.size,
    };
  }

  async getPresignedUrl(objectKey: string) {
    const url = await getSignedUrl(
      this.s3,
      new GetObjectCommand({ Bucket: this.bucket, Key: objectKey }),
      { expiresIn: 3600 },
    );
    return url;
  }
}
