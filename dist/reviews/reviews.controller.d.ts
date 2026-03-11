import { ReviewsService } from './reviews.service';
import { User } from '../database/entities/user.entity';
export declare class ReviewsController {
    private reviewsService;
    constructor(reviewsService: ReviewsService);
    getByUser(userId: string, page?: number, size?: number): Promise<{
        success: boolean;
        message: string;
        data: {
            content: {
                id: string;
                rating: number;
                comment: string;
                author: {
                    id: string;
                    fullName: string;
                    avatarUrl: string;
                };
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
    canReview(user: User, applicationId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            canReview: boolean;
            reason: string;
        };
        errors: any;
    }>;
    create(user: User, dto: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            rating: number;
            comment: string;
            author: {
                id: string;
                fullName: string;
                avatarUrl: string;
            };
            createdAt: Date;
        };
        errors: any;
    }>;
}
