import { Repository } from 'typeorm';
import { PortfolioItem } from '../database/entities/portfolio-item.entity';
import { BloggerProfile } from '../database/entities/blogger-profile.entity';
export declare class PortfolioService {
    private itemRepo;
    private bloggerRepo;
    constructor(itemRepo: Repository<PortfolioItem>, bloggerRepo: Repository<BloggerProfile>);
    getPortfolio(userId: string): Promise<{
        id: string;
        mediaUrl: string;
        title: string;
        contentType: string;
        thumbnailUrl: string;
        sortOrder: number;
    }[]>;
    add(userId: string, dto: any): Promise<{
        id: string;
        mediaUrl: string;
        title: string;
        contentType: string;
        thumbnailUrl: string;
        sortOrder: number;
    }>;
    delete(userId: string, itemId: string): Promise<void>;
    reorder(userId: string, orderedIds: string[]): Promise<{
        id: string;
        mediaUrl: string;
        title: string;
        contentType: string;
        thumbnailUrl: string;
        sortOrder: number;
    }[]>;
    getFeed(query: {
        contentType?: string;
        category?: string;
        platform?: string;
        followersMin?: string;
        followersMax?: string;
        page?: string;
        size?: string;
    }): Promise<{
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
    }>;
    formatFeed(i: any): {
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
    };
    format(i: PortfolioItem): {
        id: string;
        mediaUrl: string;
        title: string;
        contentType: string;
        thumbnailUrl: string;
        sortOrder: number;
    };
}
