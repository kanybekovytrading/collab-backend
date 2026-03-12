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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const crypto_1 = require("crypto");
const config_1 = require("@nestjs/config");
const media_service_1 = require("./media.service");
const api_response_1 = require("../common/dto/api-response");
let MediaController = class MediaController {
    mediaService;
    cfg;
    constructor(mediaService, cfg) {
        this.mediaService = mediaService;
        this.cfg = cfg;
    }
    async upload(type, entityId, file) {
        if (!type)
            throw new common_1.BadRequestException('type is required');
        if (!entityId)
            throw new common_1.BadRequestException('entityId is required');
        if (!file)
            throw new common_1.BadRequestException('file is required');
        return (0, api_response_1.apiResponse)(await this.mediaService.upload(type, entityId, file));
    }
    async signedUrl(fileId, resourceType = 'image') {
        if (!fileId)
            throw new common_1.BadRequestException('fileId is required');
        return (0, api_response_1.apiResponse)(this.mediaService.getSignedUrl(fileId, resourceType));
    }
    async cloudinaryWebhook(body, signature, timestamp) {
        this.verifyWebhookSignature(JSON.stringify(body), timestamp, signature);
        if (body.notification_type === 'eager' && body.public_id) {
            const data = this.mediaService.handleVideoReady(body.public_id);
            console.log(`Video ready: ${data.fileId} → ${data.hlsUrl}`);
        }
        return { received: true };
    }
    verifyWebhookSignature(body, timestamp, signature) {
        const apiSecret = this.cfg.get('CLOUDINARY_API_SECRET');
        const expected = (0, crypto_1.createHmac)('sha256', apiSecret)
            .update(body + timestamp)
            .digest('hex');
        if (expected !== signature) {
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
        const age = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10);
        if (age > 300) {
            throw new common_1.BadRequestException('Webhook timestamp expired');
        }
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Загрузить файл' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('entityId')),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)('signed-url'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Получить подписанную ссылку на файл' }),
    __param(0, (0, common_1.Query)('fileId')),
    __param(1, (0, common_1.Query)('resourceType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "signedUrl", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-cld-signature')),
    __param(2, (0, common_1.Headers)('x-cld-timestamp')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "cloudinaryWebhook", null);
exports.MediaController = MediaController = __decorate([
    (0, swagger_1.ApiTags)('Media'),
    (0, common_1.Controller)('media'),
    __metadata("design:paramtypes", [media_service_1.MediaService,
        config_1.ConfigService])
], MediaController);
//# sourceMappingURL=media.controller.js.map