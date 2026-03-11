import { PortfolioService } from './portfolio.service';
import { User } from '../database/entities/user.entity';
export declare class PortfolioController {
    private portfolioService;
    constructor(portfolioService: PortfolioService);
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
