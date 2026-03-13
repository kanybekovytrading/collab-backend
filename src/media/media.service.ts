import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

// ─── Конфиг типов ─────────────────────────────────────────────────────────────

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
  hlsUrl: null; // Tigris не транскодирует — всегда null
  status: 'ready'; // файл сразу готов
  contentType: string;
  sizeBytes: number;
}

export interface PresignedUploadResult {
  uploadUrl: string; // PUT сюда файл напрямую
  publicUrl: string; // итоговый публичный URL после загрузки
  fileId: string; // key в bucket
  expiresIn: number; // секунды
}

// ─── Сервис ───────────────────────────────────────────────────────────────────

@Injectable()
export class MediaService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicBase: string;

  constructor(private cfg: ConfigService) {
    const endpoint = cfg.getOrThrow<string>('MINIO_ENDPOINT'); // https://t3.storageapi.dev
    const accessKey = cfg.getOrThrow<string>('MINIO_ACCESS_KEY');
    const secretKey = cfg.getOrThrow<string>('MINIO_SECRET_KEY');
    this.bucket = cfg.getOrThrow<string>('MINIO_BUCKET'); // spacious-locker-mwfnscgh3

    this.s3 = new S3Client({
      endpoint,
      region: cfg.get<string>('MINIO_REGION', 'auto'),
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      forcePathStyle: true, // обязательно для Tigris
    });

    // Публичный базовый URL для отдачи файлов
    // Формат: https://<bucket>.t3.storageapi.dev  (virtual-hosted style)
    // Или path-style: https://t3.storageapi.dev/<bucket>
    // Tigris рекомендует virtual-hosted, но для auto-region используем path-style
    this.publicBase = `${endpoint}/${this.bucket}`;
  }

  // ── Прямая загрузка через сервер (мультипарт) ────────────────────────────
  // Используется как fallback или для небольших файлов
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

    const ext = this.getExt(file.originalname, file.mimetype);
    const key = `${FOLDERS[type] || type.toLowerCase()}/${entityId}/${uuidv4()}${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // Публичный доступ на чтение
        ACL: 'public-read',
      }),
    );

    return {
      fileId: key,
      url: `${this.publicBase}/${key}`,
      hlsUrl: null,
      status: 'ready',
      contentType: file.mimetype,
      sizeBytes: file.size,
    };
  }

  // ── Presigned URL для прямой загрузки с клиента ───────────────────────────
  // Клиент получает uploadUrl → PUT файл напрямую на Tigris → Railway не участвует
  async getPresignedUpload(
    type: string,
    entityId: string,
    contentType: string,
    sizeBytes: number,
  ): Promise<PresignedUploadResult> {
    const typeConfig = ALLOWED_TYPES[type];
    if (!typeConfig) throw new BadRequestException('Invalid upload type');

    const isAllowedMime = typeConfig.mimeTypes.some((m) =>
      contentType.startsWith(m),
    );
    if (!isAllowedMime)
      throw new BadRequestException(
        `File type ${contentType} not allowed for ${type}`,
      );
    if (sizeBytes > typeConfig.maxBytes)
      throw new BadRequestException('File too large');

    const ext = this.getMimeExt(contentType);
    const key = `${FOLDERS[type] || type.toLowerCase()}/${entityId}/${uuidv4()}${ext}`;
    const EXPIRES = 300; // 5 минут на загрузку

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
      ACL: 'public-read',
    });

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: EXPIRES,
    });

    return {
      uploadUrl,
      publicUrl: `${this.publicBase}/${key}`,
      fileId: key,
      expiresIn: EXPIRES,
    };
  }

  // ── Удаление файла ────────────────────────────────────────────────────────
  async delete(fileId: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: fileId,
      }),
    );
  }

  // ── Проверить существование ───────────────────────────────────────────────
  async exists(fileId: string): Promise<boolean> {
    try {
      await this.s3.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: fileId }),
      );
      return true;
    } catch {
      return false;
    }
  }

  // ── Получить публичный URL по fileId ──────────────────────────────────────
  getPublicUrl(fileId: string): string {
    return `${this.publicBase}/${fileId}`;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private getExt(filename: string, mimetype: string): string {
    const fromName = filename?.includes('.')
      ? '.' + filename.split('.').pop().toLowerCase()
      : null;
    return fromName ?? this.getMimeExt(mimetype);
  }

  private getMimeExt(mime: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/heic': '.heic',
      'video/mp4': '.mp4',
      'video/quicktime': '.mov',
      'video/webm': '.webm',
      'video/x-m4v': '.m4v',
    };
    return map[mime] ?? '';
  }
}
