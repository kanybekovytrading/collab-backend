import { BloggersService } from './bloggers.service';
import { User } from '../database/entities/user.entity';
export declare class BloggersController {
    private bloggersService;
    constructor(bloggersService: BloggersService);
    getAll(query: any): Promise<{
        success: boolean;
        message: string;
        data: {
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
        };
        errors: any;
    }>;
    getOne(userId: string): Promise<{
        success: boolean;
        message: string;
        data: {
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
        errors: any;
    }>;
    update(user: User, dto: any): Promise<{
        success: boolean;
        message: string;
        data: {
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
        errors: any;
    }>;
}
