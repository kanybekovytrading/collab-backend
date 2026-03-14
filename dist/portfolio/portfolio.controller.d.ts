import { PortfolioService } from './portfolio.service';
import { User } from '../database/entities/user.entity';
export declare class PortfolioController {
    private portfolioService;
    constructor(portfolioService: PortfolioService);
    getFeed(query: any): Promise<{
        success: boolean;
        message: string;
        data: {
            content: {
                id: any;
                mediaUrl: any;
                thumbnailUrl: any;
                contentType: any;
                title: any;
                createdAt: any;
                blogger: {
                    id: any;
                    fullName: any;
                    avatarUrl: any;
                    categories: any;
                    socialAccounts: any;
                    rating: number;
                    completedTasksCount: any;
                };
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
    getPortfolio(userId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            mediaUrl: string;
            title: string;
            contentType: string;
            thumbnailUrl: string;
            sortOrder: number;
        }[];
        errors: any;
    }>;
    add(user: User, dto: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            mediaUrl: string;
            title: string;
            contentType: string;
            thumbnailUrl: string;
            sortOrder: number;
        };
        errors: any;
    }>;
    delete(user: User, itemId: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        errors: any;
    }>;
    reorder(user: User, dto: {
        orderedIds: string[];
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            mediaUrl: string;
            title: string;
            contentType: string;
            thumbnailUrl: string;
            sortOrder: number;
        }[];
        errors: any;
    }>;
}
