"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnlineStatusService = void 0;
const common_1 = require("@nestjs/common");
let OnlineStatusService = class OnlineStatusService {
    onlineUsers = new Map();
    setOnline(userId) {
        const existing = this.onlineUsers.get(userId);
        if (existing)
            clearTimeout(existing);
        const timer = setTimeout(() => {
            this.onlineUsers.delete(userId);
        }, 30000);
        this.onlineUsers.set(userId, timer);
    }
    setOffline(userId) {
        const existing = this.onlineUsers.get(userId);
        if (existing)
            clearTimeout(existing);
        this.onlineUsers.delete(userId);
    }
    isOnline(userId) {
        return this.onlineUsers.has(userId);
    }
};
exports.OnlineStatusService = OnlineStatusService;
exports.OnlineStatusService = OnlineStatusService = __decorate([
    (0, common_1.Injectable)()
], OnlineStatusService);
//# sourceMappingURL=online-status.service.js.map