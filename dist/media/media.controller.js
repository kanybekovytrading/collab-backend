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
const media_service_1 = require("./media.service");
const api_response_1 = require("../common/dto/api-response");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const public_decorator_1 = require("../common/decorators/public.decorator");
let MediaController = class MediaController {
    mediaService;
    constructor(mediaService) {
        this.mediaService = mediaService;
    }
    async getFile(key) {
        if (!key)
            throw new common_1.BadRequestException('key is required');
        const url = await this.mediaService.getPresignedReadUrl(key);
        return { url, statusCode: 302 };
    }
    async presign(type, entityId, contentType, sizeBytes) {
        if (!type)
            throw new common_1.BadRequestException('type is required');
        if (!entityId)
            throw new common_1.BadRequestException('entityId is required');
        if (!contentType)
            throw new common_1.BadRequestException('contentType is required');
        if (!sizeBytes)
            throw new common_1.BadRequestException('sizeBytes is required');
        const result = await this.mediaService.getPresignedUpload(type, entityId, contentType, Number(sizeBytes));
        return (0, api_response_1.apiResponse)(result);
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
    async delete(fileId) {
        if (!fileId)
            throw new common_1.BadRequestException('fileId is required');
        await this.mediaService.delete(fileId);
        return (0, api_response_1.apiResponse)({ deleted: true });
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('file'),
    (0, common_1.Redirect)(),
    (0, swagger_1.ApiOperation)({ summary: 'Получить файл по ключу (публичный редирект)' }),
    (0, swagger_1.ApiQuery)({ name: 'key', example: 'portfolio/uuid/file.jpg' }),
    __param(0, (0, common_1.Query)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getFile", null);
__decorate([
    (0, common_1.Get)('presign'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получить presigned URL для прямой загрузки на Tigris',
    }),
    (0, swagger_1.ApiQuery)({ name: 'type', example: 'PORTFOLIO' }),
    (0, swagger_1.ApiQuery)({ name: 'entityId', example: 'user-uuid' }),
    (0, swagger_1.ApiQuery)({ name: 'contentType', example: 'video/mp4' }),
    (0, swagger_1.ApiQuery)({ name: 'sizeBytes', example: '15000000' }),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('entityId')),
    __param(2, (0, common_1.Query)('contentType')),
    __param(3, (0, common_1.Query)('sizeBytes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "presign", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Загрузить файл через сервер (fallback)' }),
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
    (0, common_1.Delete)(':fileId'),
    (0, swagger_1.ApiOperation)({ summary: 'Удалить файл из хранилища' }),
    __param(0, (0, common_1.Param)('fileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "delete", null);
exports.MediaController = MediaController = __decorate([
    (0, swagger_1.ApiTags)('Media'),
    (0, common_1.Controller)('media'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [media_service_1.MediaService])
], MediaController);
//# sourceMappingURL=media.controller.js.map