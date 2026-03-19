import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import type { Cache } from 'cache-manager';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private cfg;
    private chatService;
    private userRepo;
    private cacheManager;
    server: Server;
    private typingTimers;
    constructor(jwtService: JwtService, cfg: ConfigService, chatService: ChatService, userRepo: Repository<User>, cacheManager: Cache);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleJoin(client: Socket, data: {
        applicationId: string;
    } | string): Promise<void>;
    handleMessage(client: Socket, data: {
        applicationId: string;
        content: string;
        attachmentUrl?: string;
        attachmentType?: string;
    }): Promise<{
        id: string;
        senderId: string;
        senderName: string;
        senderAvatar: string;
        content: string;
        attachmentUrl: string;
        attachmentType: string;
        read: boolean;
        status: import("./chat-message-status.enum").ChatMessageStatus;
        systemMessage: boolean;
        recipientId: string;
        createdAt: Date;
    }>;
    handleRead(client: Socket, data: {
        applicationId: string;
    }): Promise<void>;
    handleTyping(client: Socket, data: {
        applicationId: string;
    }): void;
    handlePing(client: Socket & {
        user?: User;
    }): Promise<void>;
}
