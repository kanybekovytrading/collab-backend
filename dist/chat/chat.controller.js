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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const chat_service_1 = require("./chat.service");
const online_status_service_1 = require("./online-status.service");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_entity_1 = require("../database/entities/user.entity");
const api_response_1 = require("../common/dto/api-response");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let ChatController = class ChatController {
    chatService;
    onlineStatus;
    userRepo;
    constructor(chatService, onlineStatus, userRepo) {
        this.chatService = chatService;
        this.onlineStatus = onlineStatus;
        this.userRepo = userRepo;
    }
    async getMyChats(user) {
        return (0, api_response_1.apiResponse)(await this.chatService.getMyChats(user.id));
    }
    async getUserStatus(userId) {
        const online = this.onlineStatus.isOnline(userId);
        const user = await this.userRepo.findOne({ where: { id: userId } });
        return (0, api_response_1.apiResponse)({
            online,
            lastSeenAt: user?.lastSeenAt ?? null,
        });
    }
    async getMessages(user, appId, page = 0, size = 30, before) {
        return (0, api_response_1.apiResponse)(await this.chatService.getMessages(appId, user.id, +page, +size, before));
    }
    async send(user, appId, dto) {
        return (0, api_response_1.apiResponse)(await this.chatService.sendMessage(appId, user, dto));
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'Список моих чатов (как Instagram Direct)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getMyChats", null);
__decorate([
    (0, common_1.Get)('users/:userId/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Онлайн статус пользователя' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getUserStatus", null);
__decorate([
    (0, common_1.Get)(':appId/messages'),
    (0, swagger_1.ApiOperation)({ summary: 'История сообщений чата' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('appId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('size')),
    __param(4, (0, common_1.Query)('before')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, Object, Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)(':appId/messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Отправить сообщение (REST fallback)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('appId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "send", null);
exports.ChatController = ChatController = __decorate([
    (0, swagger_1.ApiTags)('Chat'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('chats'),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        online_status_service_1.OnlineStatusService,
        typeorm_2.Repository])
], ChatController);
//# sourceMappingURL=chat.controller.js.map