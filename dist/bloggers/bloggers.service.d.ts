import { Repository } from 'typeorm';
import { BloggerProfile } from '../database/entities/blogger-profile.entity';
export declare class BloggersService {
    private bloggerRepo;
    constructor(bloggerRepo: Repository<BloggerProfile>);
    findAll(filters: any): Promise<{
        content: {
            id: string;
            fullName: string;
            avatarUrl: string;
            city: string;
            country: string;
            age: number;
            verified: boolean;
            bio: string;
            categories: string[];
            minPrice: number;
            worksWithBarter: boolean;
            rating: number;
            completedTasksCount: number;
            reviewsCount: number;
            socialAccounts: any[];
            portfolioItems: {
                id: string;
                mediaUrl: string;
                title: string;
                contentType: string;
                thumbnailUrl: string;
                sortOrder: number;
            }[];
            rank: number;
        }[];
        page: any;
        size: any;
        totalElements: number;
        totalPages: number;
        first: boolean;
        last: boolean;
    }>;
    findOne(userId: string): Promise<{
        id: string;
        fullName: string;
        avatarUrl: string;
        city: string;
        country: string;
        age: number;
        verified: boolean;
        bio: string;
        categories: string[];
        minPrice: number;
        worksWithBarter: boolean;
        rating: number;
        completedTasksCount: number;
        reviewsCount: number;
        socialAccounts: any[];
        portfolioItems: {
            id: string;
            mediaUrl: string;
            title: string;
            contentType: string;
            thumbnailUrl: string;
            sortOrder: number;
        }[];
        rank: number;
    }>;
    update(userId: string, dto: any): Promise<{
        id: string;
        fullName: string;
        avatarUrl: string;
        city: string;
        country: string;
        age: number;
        verified: boolean;
        bio: string;
        categories: string[];
        minPrice: number;
        worksWithBarter: boolean;
        rating: number;
        completedTasksCount: number;
        reviewsCount: number;
        socialAccounts: any[];
        portfolioItems: {
            id: string;
            mediaUrl: string;
            title: string;
            contentType: string;
            thumbnailUrl: string;
            sortOrder: number;
        }[];
        rank: number;
    }>;
    format(b: BloggerProfile, rank?: number): {
        id: string;
        fullName: string;
        avatarUrl: string;
        city: string;
        country: string;
        age: number;
        verified: boolean;
        bio: string;
        categories: string[];
        minPrice: number;
        worksWithBarter: boolean;
        rating: number;
        completedTasksCount: number;
        reviewsCount: number;
        socialAccounts: any[];
        portfolioItems: {
            id: string;
            mediaUrl: string;
            title: string;
            contentType: string;
            thumbnailUrl: string;
            sortOrder: number;
        }[];
        rank: number;
    };
}
