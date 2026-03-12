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
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
const ALLOWED_TYPES = {
    USER_AVATAR: { mimeTypes: ['image/'], maxBytes: 10 * 1024 * 1024 },
    TASK_COVER: { mimeTypes: ['image/'], maxBytes: 10 * 1024 * 1024 },
    BRAND_LOGO: { mimeTypes: ['image/'], maxBytes: 10 * 1024 * 1024 },
    PORTFOLIO: { mimeTypes: ['image/', 'video/'], maxBytes: 500 * 1024 * 1024 },
    WORK_SUBMISSION: { mimeTypes: ['image/', 'video/'], maxBytes: 500 * 1024 * 1024 },
    CHAT_ATTACHMENT: { mimeTypes: ['image/', 'video/', 'application/pdf'], maxBytes: 50 * 1024 * 1024 },
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
    constructor(cfg) {
        this.cfg = cfg;
        cloudinary_1.v2.config({
            cloud_name: cfg.get('CLOUDINARY_CLOUD_NAME'),
            api_key: cfg.get('CLOUDINARY_API_KEY'),
            api_secret: cfg.get('CLOUDINARY_API_SECRET'),
            secure: true,
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
        const folder = `collab/${FOLDERS[type] || type.toLowerCase()}/${entityId}`;
        const isVideo = file.mimetype.startsWith('video/');
        const resourceType = isVideo ? 'video' : file.mimetype === 'application/pdf' ? 'raw' : 'image';
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
    async getPresignedUrl(objectKey) {
        return cloudinary_1.v2.url(objectKey, {
            secure: true,
            resource_type: 'auto',
        });
    }
    uploadToCloudinary(buffer, options) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream(options, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
            stream_1.Readable.from(buffer).pipe(uploadStream);
        });
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MediaService);
//# sourceMappingURL=media.service.js.map