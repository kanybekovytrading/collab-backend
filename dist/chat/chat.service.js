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
const notification_service_1 = require("../notifications/notification.service");
const chat_message_status_enum_1 = require("./chat-message-status.enum");
let ChatService = class ChatService {
    msgRepo;
    appRepo;
    notificationService;
    constructor(msgRepo, appRepo, notificationService) {
        this.msgRepo = msgRepo;
        this.appRepo = appRepo;
        this.notificationService = notificationService;
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
    async getMyChats(userId) {
        const applications = await this.appRepo.find({
            where: [{ blogger: { id: userId } }, { task: { brand: { id: userId } } }],
            relations: ['blogger', 'task', 'task.brand'],
            order: { createdAt: 'DESC' },
        });
        const validApps = applications.filter((app) => app.blogger && app.task && app.task.brand);
        const chats = await Promise.all(validApps.map(async (app) => {
            const lastMessage = await this.msgRepo.findOne({
                where: { application: { id: app.id } },
                relations: ['sender'],
                order: { createdAt: 'DESC' },
            });
            const unreadCount = await this.msgRepo.count({
                where: {
                    application: { id: app.id },
                    recipient: { id: userId },
                    read: false,
                },
            });
            const isBlogger = app.blogger.id === userId;
            const participant = isBlogger
                ? {
                    id: app.task.brand.id,
                    fullName: app.task.brand.fullName,
                    avatarUrl: app.task.brand.avatarUrl ?? null,
                }
                : {
                    id: app.blogger.id,
                    fullName: app.blogger.fullName,
                    avatarUrl: app.blogger.avatarUrl ?? null,
                };
            return {
                applicationId: app.id,
                taskTitle: app.task.title,
                taskId: app.task.id,
                status: app.status,
                participant,
                lastMessage: lastMessage
                    ? {
                        content: lastMessage.content,
                        senderId: lastMessage.sender?.id,
                        createdAt: lastMessage.createdAt,
                    }
                    : null,
                unreadCount,
                updatedAt: lastMessage?.createdAt ?? app.createdAt,
            };
        }));
        return chats.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    async getMessages(appId, userId, page = 0, size = 30, before) {
        await this.getApplicationAndValidate(appId, userId);
        await this.markAsRead(appId, userId);
        const qb = this.msgRepo
            .createQueryBuilder('m')
            .leftJoinAndSelect('m.sender', 'sender')
            .leftJoinAndSelect('m.recipient', 'recipient')
            .where('m.applicationId = :appId', { appId })
            .orderBy('m.createdAt', 'DESC')
            .take(size);
        if (before) {
            const cursor = await this.msgRepo.findOne({ where: { id: before } });
            if (cursor) {
                qb.andWhere('m.createdAt < :cursorDate', {
                    cursorDate: cursor.createdAt,
                });
            }
        }
        else {
            qb.skip(page * size);
        }
        const [items, total] = await qb.getManyAndCount();
        return {
            content: items.map((m) => this.format(m)),
            nextCursor: items.length === size ? items[items.length - 1].id : null,
            hasMore: items.length === size,
            totalElements: total,
        };
    }
    async sendMessage(appId, sender, dto) {
        const app = await this.getApplicationAndValidate(appId, sender.id);
        const recipient = app.blogger.id === sender.id ? app.task.brand : app.blogger;
        const msg = this.msgRepo.create({
            application: app,
            sender,
            recipient: { id: recipient.id },
            content: dto.content,
            attachmentUrl: dto.attachmentUrl,
            attachmentType: dto.attachmentType,
            status: chat_message_status_enum_1.ChatMessageStatus.SENT,
        });
        await this.msgRepo.save(msg);
        void this.notificationService.send(recipient.fcmToken, sender.fullName ?? 'Новое сообщение', dto.content ?? '📎 Вложение', { type: 'NEW_MESSAGE', appId });
        return this.format(msg);
    }
    async markAsRead(appId, userId) {
        await this.msgRepo
            .createQueryBuilder()
            .update(chat_message_entity_1.ChatMessage)
            .set({ read: true, status: chat_message_status_enum_1.ChatMessageStatus.READ })
            .where('"applicationId" = :appId AND "recipientId" = :uid AND read = false', { appId, uid: userId })
            .execute();
    }
    async markAsDelivered(appId, userId) {
        await this.msgRepo
            .createQueryBuilder()
            .update(chat_message_entity_1.ChatMessage)
            .set({ status: chat_message_status_enum_1.ChatMessageStatus.DELIVERED })
            .where('"applicationId" = :appId AND "recipientId" = :uid AND status = :status', { appId, uid: userId, status: chat_message_status_enum_1.ChatMessageStatus.SENT })
            .execute();
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
            status: m.status || chat_message_status_enum_1.ChatMessageStatus.SENT,
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
        typeorm_2.Repository,
        notification_service_1.NotificationService])
], ChatService);
//# sourceMappingURL=chat.service.js.map