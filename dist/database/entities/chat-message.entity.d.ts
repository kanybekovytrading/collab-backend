import { User } from './user.entity';
import { Application } from './application.entity';
export declare class ChatMessage {
    id: string;
    application: Application;
    sender: User;
    recipient: User;
    content: string;
    attachmentUrl: string;
    attachmentType: string;
    read: boolean;
    systemMessage: boolean;
    createdAt: Date;
}
