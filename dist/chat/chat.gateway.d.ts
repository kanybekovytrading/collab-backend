import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private cfg;
    private chatService;
    private userRepo;
    server: Server;
    constructor(jwtService: JwtService, cfg: ConfigService, chatService: ChatService, userRepo: Repository<User>);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoin(client: Socket, appId: string): void;
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
        systemMessage: boolean;
        recipientId: string;
        createdAt: Date;
    }>;
    handleTyping(client: Socket, data: {
        applicationId: string;
    }): void;
}
