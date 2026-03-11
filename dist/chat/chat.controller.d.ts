import { ChatService } from './chat.service';
import { User } from '../database/entities/user.entity';
export declare class ChatController {
    private chatService;
    constructor(chatService: ChatService);
    getMessages(user: User, appId: string, page?: number, size?: number): Promise<{
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
            systemMessage: boolean;
            recipientId: string;
            createdAt: Date;
        };
        errors: any;
    }>;
}
