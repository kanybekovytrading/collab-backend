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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const chat_message_entity_1 = require("../database/entities/chat-message.entity");
const application_entity_1 = require("../database/entities/application.entity");
let ChatService = class ChatService {
    msgRepo;
    appRepo;
    constructor(msgRepo, appRepo) {
        this.msgRepo = msgRepo;
        this.appRepo = appRepo;
    }
    async getApplicationAndValidate(appId, userId) {
        const app = await this.appRepo.findOne({
            where: { id: appId },
            relations: ['blogger', 'task', 'task.brand'],
        });
        if (!app)
            throw new common_1.NotFoundException('Application not found');
        const isParticipant = app.blogger.id === userId || app.task.brand.id === userId;
        if (!isParticipant)
            throw new common_1.ForbiddenException('Not a participant');
        return app;
    }
    async getMessages(appId, userId, page = 0, size = 50) {
        const app = await this.getApplicationAndValidate(appId, userId);
        await this.msgRepo
            .createQueryBuilder()
            .update(chat_message_entity_1.ChatMessage)
            .set({ read: true })
            .where('"applicationId" = :appId AND "recipientId" = :uid AND read = false', {
            appId,
            uid: userId,
        })
            .execute();
        const [items, total] = await this.msgRepo.findAndCount({
            where: { application: { id: appId } },
            relations: ['sender', 'recipient'],
            order: { createdAt: 'DESC' },
            skip: page * size,
            take: size,
        });
        return {
            content: items.map((m) => this.format(m)),
            page,
            size,
            totalElements: total,
            totalPages: Math.ceil(total / size),
            first: page === 0,
            last: (page + 1) * size >= total,
        };
    }
    async sendMessage(appId, sender, dto) {
        const app = await this.getApplicationAndValidate(appId, sender.id);
        const recipientId = app.blogger.id === sender.id ? app.task.brand.id : app.blogger.id;
        const msg = this.msgRepo.create({
            application: app,
            sender,
            recipient: { id: recipientId },
            content: dto.content,
            attachmentUrl: dto.attachmentUrl,
            attachmentType: dto.attachmentType,
        });
        await this.msgRepo.save(msg);
        return this.format(msg);
    }
    format(m) {
        return {
            id: m.id,
            senderId: m.sender?.id,
            senderName: m.sender?.fullName,
            senderAvatar: m.sender?.avatarUrl,
            content: m.content,
            attachmentUrl: m.attachmentUrl,
            attachmentType: m.attachmentType,
            read: m.read,
            systemMessage: m.systemMessage,
            recipientId: m.recipient?.id,
            createdAt: m.createdAt,
        };
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(chat_message_entity_1.ChatMessage)),
    __param(1, (0, typeorm_1.InjectRepository)(application_entity_1.Application)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ChatService);
//# sourceMappingURL=chat.service.js.map