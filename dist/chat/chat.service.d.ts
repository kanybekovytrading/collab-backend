import { Repository } from 'typeorm';
import { ChatMessage } from '../database/entities/chat-message.entity';
import { Application } from '../database/entities/application.entity';
import { User } from '../database/entities/user.entity';
import { NotificationService } from '../notifications/notification.service';
import { ChatMessageStatus } from './chat-message-status.enum';
export declare class ChatService {
    private msgRepo;
    private appRepo;
    private readonly notificationService;
    constructor(msgRepo: Repository<ChatMessage>, appRepo: Repository<Application>, notificationService: NotificationService);
    private getApplicationAndValidate;
    getMyChats(userId: string): Promise<{
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
    }[]>;
    getMessages(appId: string, userId: string, page?: number, size?: number, before?: string): Promise<{
        content: {
            id: string;
            senderId: string;
            senderName: string;
            senderAvatar: string;
            content: string;
            attachmentUrl: string;
            attachmentType: string;
            read: boolean;
            status: ChatMessageStatus;
            systemMessage: boolean;
            recipientId: string;
            createdAt: Date;
        }[];
        nextCursor: string;
        hasMore: boolean;
        totalElements: number;
    }>;
    sendMessage(appId: string, sender: User, dto: {
        content?: string;
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
        status: ChatMessageStatus;
        systemMessage: boolean;
        recipientId: string;
        createdAt: Date;
    }>;
    markAsRead(appId: string, userId: string): Promise<void>;
    markAsDelivered(appId: string, userId: string): Promise<void>;
    format(m: ChatMessage): {
        id: string;
        senderId: string;
        senderName: string;
        senderAvatar: string;
        content: string;
        attachmentUrl: string;
        attachmentType: string;
        read: boolean;
        status: ChatMessageStatus;
        systemMessage: boolean;
        recipientId: string;
        createdAt: Date;
    };
}
