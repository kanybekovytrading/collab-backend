import { ChatService } from './chat.service';
import { User } from '../database/entities/user.entity';
import type { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
export declare class ChatController {
    private chatService;
    private cacheManager;
    private userRepo;
    constructor(chatService: ChatService, cacheManager: Cache, userRepo: Repository<User>);
    getMyChats(user: User): Promise<{
        success: boolean;
        message: string;
        data: {
            applicationId: string;
            taskTitle: string;
            taskId: string;
            status: import("../database/entities/application.entity").ApplicationStatus;
            participant: {
                id: string;
                fullName: string;
                avatarUrl: any;
            };
            lastMessage: {
                content: string;
                senderId: string;
                createdAt: Date;
            };
            unreadCount: number;
            updatedAt: Date;
        }[];
        errors: any;
    }>;
    getUserStatus(userId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            online: boolean;
            lastSeenAt: Date;
        };
        errors: any;
    }>;
    getMessages(user: User, appId: string, page?: number, size?: number, before?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            content: {
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
            }[];
            nextCursor: string;
            hasMore: boolean;
            totalElements: number;
        };
        errors: any;
    }>;
    send(user: User, appId: string, dto: any): Promise<{
        success: boolean;
        message: string;
        data: {
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
        };
        errors: any;
    }>;
}
