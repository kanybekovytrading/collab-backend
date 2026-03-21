"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const expo_server_sdk_1 = __importDefault(require("expo-server-sdk"));
let NotificationService = NotificationService_1 = class NotificationService {
    logger = new common_1.Logger(NotificationService_1.name);
    expo = new expo_server_sdk_1.default();
    async send(token, title, body, data) {
        if (!token || !expo_server_sdk_1.default.isExpoPushToken(token))
            return;
        try {
            const message = {
                to: token,
                title,
                body,
                data: data ?? {},
                sound: 'default',
                priority: 'high',
            };
            await this.expo.sendPushNotificationsAsync([message]);
        }
        catch (e) {
            this.logger.warn(`Push failed: ${e.message}`);
        }
    }
    async sendToMany(tokens, title, body, data) {
        const valid = tokens.filter((t) => t && expo_server_sdk_1.default.isExpoPushToken(t));
        if (!valid.length)
            return;
        const messages = valid.map((token) => ({
            to: token,
            title,
            body,
            data: data ?? {},
            sound: 'default',
            priority: 'high',
        }));
        const chunks = this.expo.chunkPushNotifications(messages);
        for (const chunk of chunks) {
            try {
                await this.expo.sendPushNotificationsAsync(chunk);
            }
            catch (e) {
                this.logger.warn(`Push chunk failed: ${e.message}`);
            }
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)()
], NotificationService);
//# sourceMappingURL=notification.service.js.map