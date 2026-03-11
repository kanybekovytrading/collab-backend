import { User } from './user.entity';
export declare class BrandProfile {
    id: string;
    user: User;
    companyName: string;
    description: string;
    websiteUrl: string;
    category: string;
    rating: number;
    tasksCount: number;
    reviewsCount: number;
    socialAccounts: any[];
    createdAt: Date;
    updatedAt: Date;
}
