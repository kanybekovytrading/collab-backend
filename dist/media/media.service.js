"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
const ALLOWED_TYPES = {
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
const FOLDERS = {
    USER_AVATAR: 'avatars',
    TASK_COVER: 'tasks',
    BRAND_LOGO: 'logos',
    PORTFOLIO: 'portfolio',
    WORK_SUBMISSION: 'submissions',
    CHAT_ATTACHMENT: 'chat',
};
let MediaService = class MediaService {
    cfg;
    s3;
    bucket;
    publicBase;
    constructor(cfg) {
        this.cfg = cfg;
        const endpoint = cfg.getOrThrow('MINIO_ENDPOINT');
        const accessKey = cfg.getOrThrow('MINIO_ACCESS_KEY');
        const secretKey = cfg.getOrThrow('MINIO_SECRET_KEY');
        this.bucket = cfg.getOrThrow('MINIO_BUCKET');
        this.s3 = new client_s3_1.S3Client({
            endpoint,
            region: cfg.get('MINIO_REGION', 'auto'),
            credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
            forcePathStyle: true,
        });
        this.publicBase = cfg.getOrThrow('R2_PUBLIC_URL');
    }
    async upload(type, entityId, file) {
        const typeConfig = ALLOWED_TYPES[type];
        if (!typeConfig)
            throw new common_1.BadRequestException('Invalid upload type');
        const isAllowedMime = typeConfig.mimeTypes.some((m) => file.mimetype.startsWith(m));
        if (!isAllowedMime)
            throw new common_1.BadRequestException(`File type ${file.mimetype} not allowed for ${type}`);
        if (file.size > typeConfig.maxBytes)
            throw new common_1.BadRequestException('File too large');
        const ext = this.getExt(file.originalname, file.mimetype);
        const key = `${FOLDERS[type] || type.toLowerCase()}/${entityId}/${(0, uuid_1.v4)()}${ext}`;
        await this.s3.send(new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        }));
        return {
            fileId: key,
            url: `${this.publicBase}/${key}`,
            hlsUrl: null,
            status: 'ready',
            contentType: file.mimetype,
            sizeBytes: file.size,
        };
    }
    async getPresignedUpload(type, entityId, contentType, sizeBytes) {
        const typeConfig = ALLOWED_TYPES[type];
        if (!typeConfig)
            throw new common_1.BadRequestException('Invalid upload type');
        const isAllowedMime = typeConfig.mimeTypes.some((m) => contentType.startsWith(m));
        if (!isAllowedMime)
            throw new common_1.BadRequestException(`File type ${contentType} not allowed for ${type}`);
        if (sizeBytes > typeConfig.maxBytes)
            throw new common_1.BadRequestException('File too large');
        const ext = this.getMimeExt(contentType);
        const key = `${FOLDERS[type] || type.toLowerCase()}/${entityId}/${(0, uuid_1.v4)()}${ext}`;
        const EXPIRES = 300;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: contentType,
        });
        const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3, command, {
            expiresIn: EXPIRES,
        });
        return {
            uploadUrl,
            publicUrl: `${this.publicBase}/${key}`,
            fileId: key,
            expiresIn: EXPIRES,
        };
    }
    async delete(fileId) {
        await this.s3.send(new client_s3_1.DeleteObjectCommand({
            Bucket: this.bucket,
            Key: fileId,
        }));
    }
    async exists(fileId) {
        try {
            await this.s3.send(new client_s3_1.HeadObjectCommand({ Bucket: this.bucket, Key: fileId }));
            return true;
        }
        catch {
            return false;
        }
    }
    getPublicUrl(fileId) {
        return `${this.publicBase}/${fileId}`;
    }
    async getPresignedReadUrl(fileId, expiresIn = 3600) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucket,
            Key: fileId,
        });
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3, command, { expiresIn });
    }
    getExt(filename, mimetype) {
        const fromName = filename?.includes('.')
            ? '.' + filename.split('.').pop().toLowerCase()
            : null;
        return fromName ?? this.getMimeExt(mimetype);
    }
    getMimeExt(mime) {
        const map = {
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
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MediaService);
//# sourceMappingURL=media.service.js.map