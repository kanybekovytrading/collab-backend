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
    WORK_SUBMISSION: { mimeTypes: ['image/', 'video/'], maxBytes: 500 * 1024 * 1024 },
    CHAT_ATTACHMENT: { mimeTypes: ['image/', 'video/', 'application/pdf'], maxBytes: 50 * 1024 * 1024 },
};
const KEY_PREFIXES = {
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
    constructor(cfg) {
        this.cfg = cfg;
        this.bucket = cfg.get('MINIO_BUCKET', 'collab');
        this.s3 = new client_s3_1.S3Client({
            endpoint: cfg.get('MINIO_ENDPOINT', 'http://localhost:9000'),
            region: cfg.get('MINIO_REGION', 'us-east-1'),
            credentials: {
                accessKeyId: cfg.get('MINIO_ACCESS_KEY', 'minioadmin'),
                secretAccessKey: cfg.get('MINIO_SECRET_KEY', 'minioadmin'),
            },
            forcePathStyle: true,
        });
    }
    async upload(type, entityId, file) {
        const typeConfig = ALLOWED_TYPES[type];
        if (!typeConfig)
            throw new common_1.BadRequestException('Invalid file type');
        const isAllowedMime = typeConfig.mimeTypes.some(m => file.mimetype.startsWith(m));
        if (!isAllowedMime)
            throw new common_1.BadRequestException(`File type ${file.mimetype} not allowed for ${type}`);
        if (file.size > typeConfig.maxBytes)
            throw new common_1.BadRequestException('File too large');
        const ext = file.originalname.split('.').pop();
        const fileId = (0, uuid_1.v4)();
        const prefix = KEY_PREFIXES[type] || type.toLowerCase();
        const objectKey = `${prefix}/${entityId}/${fileId}.${ext}`;
        await this.s3.send(new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: objectKey,
            Body: file.buffer,
            ContentType: file.mimetype,
        }));
        const presignedUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3, new client_s3_1.GetObjectCommand({ Bucket: this.bucket, Key: objectKey }), { expiresIn: 3600 });
        return {
            fileId,
            objectKey,
            presignedUrl,
            contentType: file.mimetype,
            sizeBytes: file.size,
        };
    }
    async getPresignedUrl(objectKey) {
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.s3, new client_s3_1.GetObjectCommand({ Bucket: this.bucket, Key: objectKey }), { expiresIn: 3600 });
        return url;
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MediaService);
//# sourceMappingURL=media.service.js.map