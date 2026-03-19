import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { OnlineStatusService } from './online-status.service';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private cfg;
    private chatService;
    private onlineStatus;
    private userRepo;
    server: Server;
    private typingTimers;
    constructor(jwtService: JwtService, cfg: ConfigService, chatService: ChatService, onlineStatus: OnlineStatusService, userRepo: Repository<User>);
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
    handlePing(client: Socket): void;
}
