import { Repository } from 'typeorm';
import { ChatMessage } from '../database/entities/chat-message.entity';
import { Application } from '../database/entities/application.entity';
import { User } from '../database/entities/user.entity';
export declare class ChatService {
    private msgRepo;
    private appRepo;
    constructor(msgRepo: Repository<ChatMessage>, appRepo: Repository<Application>);
    private getApplicationAndValidate;
    getMessages(appId: string, userId: string, page?: number, size?: number): Promise<{
        content: {
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
        }[];
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
        first: boolean;
        last: boolean;
    }>;
    sendMessage(appId: string, sender: User, dto: any): Promise<{
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
    format(m: ChatMessage): {
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
    };
}
