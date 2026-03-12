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
            throw new common_1.BadRequestException('Invalid upload type');
        const isAllowedMime = typeConfig.mimeTypes.some((m) => file.mimetype.startsWith(m));
        if (!isAllowedMime)
            throw new common_1.BadRequestException(`File type ${file.mimetype} not allowed for ${type}`);
        if (file.size > typeConfig.maxBytes)
            throw new common_1.BadRequestException('File too large');
        const folder = `collab/${FOLDERS[type] || type.toLowerCase()}/${entityId}`;
        const isVideo = file.mimetype.startsWith('video/');
        const resourceType = isVideo ? 'video' : 'image';
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
    getUploadSignature(type, entityId) {
        const typeConfig = ALLOWED_TYPES[type];
        if (!typeConfig)
            throw new common_1.BadRequestException('Invalid upload type');
        const folder = `collab/${FOLDERS[type] || type.toLowerCase()}/${entityId}`;
        const timestamp = Math.floor(Date.now() / 1000);
        const mightBeVideo = ['PORTFOLIO', 'WORK_SUBMISSION'].includes(type);
        const paramsToSign = {
            folder,
            timestamp,
            ...(mightBeVideo && {
                eager: 'sp_full_hd/m3u8',
                eager_async: 'true',
                eager_notification_url: this.cfg.get('CLOUDINARY_WEBHOOK_URL') ?? '',
            }),
        };
        const signature = cloudinary_1.v2.utils.api_sign_request(paramsToSign, this.cfg.get('CLOUDINARY_API_SECRET'));
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
    handleVideoReady(publicId) {
        const hlsUrl = cloudinary_1.v2.url(publicId, {
            resource_type: 'video',
            secure: true,
            streaming_profile: 'full_hd',
            format: 'm3u8',
        });
        return { fileId: publicId, hlsUrl };
    }
    getSignedUrl(publicId, resourceType = 'image') {
        return cloudinary_1.v2.url(publicId, {
            secure: true,
            resource_type: resourceType,
            sign_url: true,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
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