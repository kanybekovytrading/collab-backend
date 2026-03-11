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
    format(i: PortfolioItem): {
        id: string;
        mediaUrl: string;
        title: string;
        contentType: string;
        thumbnailUrl: string;
        sortOrder: number;
    };
}
