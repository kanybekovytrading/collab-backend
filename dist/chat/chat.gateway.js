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
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const chat_service_1 = require("./chat.service");
const online_status_service_1 = require("./online-status.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../database/entities/user.entity");
let ChatGateway = class ChatGateway {
    jwtService;
    cfg;
    chatService;
    onlineStatus;
    userRepo;
    server;
    typingTimers = new Map();
    constructor(jwtService, cfg, chatService, onlineStatus, userRepo) {
        this.jwtService = jwtService;
        this.cfg = cfg;
        this.chatService = chatService;
        this.onlineStatus = onlineStatus;
        this.userRepo = userRepo;
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token ||
                client.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token, {
                secret: this.cfg.get('JWT_SECRET', 'secret'),
            });
            const user = await this.userRepo.findOne({ where: { id: payload.sub } });
            if (!user) {
                client.disconnect();
                return;
            }
            client.user = user;
            this.onlineStatus.setOnline(user.id);
            client.broadcast.emit('user:online', { userId: user.id });
            console.log('[WS] Connected:', user.id, user.fullName);
        }
        catch {
            client.disconnect();
        }
    }
    async handleDisconnect(client) {
        const user = client.user;
        if (user) {
            this.onlineStatus.setOffline(user.id);
            await this.userRepo.update(user.id, { lastSeenAt: new Date() });
            client.broadcast.emit('user:offline', {
                userId: user.id,
                lastSeenAt: new Date(),
            });
        }
        console.log('[WS] Disconnected:', user?.id ?? client.id);
    }
    async handleJoin(client, data) {
        const appId = typeof data === 'string' ? data : data.applicationId;
        const user = client.user;
        client.join(`chat:${appId}`);
        console.log('[WS] User', user?.id, 'joined chat:', appId);
        if (user && typeof data === 'object') {
            await this.chatService.markAsDelivered(appId, user.id);
            this.server.to(`chat:${appId}`).emit('delivered', {
                applicationId: appId,
                deliveredAt: new Date(),
                userId: user.id,
            });
        }
    }
    async handleMessage(client, data) {
        const user = client.user;
        if (!user)
            return;
        try {
            const msg = await this.chatService.sendMessage(data.applicationId, user, data);
            this.server.to(`chat:${data.applicationId}`).emit('message', msg);
            return msg;
        }
        catch (e) {
            client.emit('error', { message: e.message });
        }
    }
    async handleRead(client, data) {
        const user = client.user;
        if (!user || !data?.applicationId)
            return;
        await this.chatService.markAsRead(data.applicationId, user.id);
        this.server.to(`chat:${data.applicationId}`).emit('read', {
            applicationId: data.applicationId,
            readAt: new Date(),
            userId: user.id,
        });
    }
    handleTyping(client, data) {
        const user = client.user;
        if (!user || !data?.applicationId)
            return;
        const key = `${user.id}:${data.applicationId}`;
        const existing = this.typingTimers.get(key);
        if (existing)
            clearTimeout(existing);
        client.to(`chat:${data.applicationId}`).emit('typing', {
            userId: user.id,
            name: user.fullName,
            isTyping: true,
        });
        const timer = setTimeout(() => {
            client.to(`chat:${data.applicationId}`).emit('typing', {
                userId: user.id,
                name: user.fullName,
                isTyping: false,
            });
            this.typingTimers.delete(key);
        }, 3000);
        this.typingTimers.set(key, timer);
    }
    handlePing(client) {
        const user = client.user;
        if (!user)
            return;
        this.onlineStatus.setOnline(user.id);
        client.emit('pong');
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handlePing", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: '*' }, namespace: '/ws' }),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        chat_service_1.ChatService,
        online_status_service_1.OnlineStatusService,
        typeorm_2.Repository])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map