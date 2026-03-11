import { User } from './user.entity';
export declare enum TaskStatus {
    ACTIVE = "ACTIVE",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    DELETED = "DELETED",
    MODERATION = "MODERATION"
}
export declare enum TaskType {
    VIDEO = "VIDEO",
    PHOTO = "PHOTO",
    REELS = "REELS",
    AI_PHOTO = "AI_PHOTO",
    AI_TEXT = "AI_TEXT"
}
export declare class Task {
    id: string;
    title: string;
    description: string;
    taskType: TaskType;
    coverImageUrl: string;
    city: string;
    online: boolean;
    deadlineDays: number;
    price: number;
    priceDescription: string;
    status: TaskStatus;
    reactionsCount: number;
    acceptsUgc: boolean;
    acceptsAi: boolean;
    genderFilter: string[];
    categories: string[];
    brand: User;
    createdAt: Date;
    updatedAt: Date;
}
