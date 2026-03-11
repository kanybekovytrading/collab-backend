import { Repository } from 'typeorm';
import { Review } from '../database/entities/review.entity';
import { Application } from '../database/entities/application.entity';
import { CompletionRecord } from '../database/entities/completion-record.entity';
import { BloggerProfile } from '../database/entities/blogger-profile.entity';
import { BrandProfile } from '../database/entities/brand-profile.entity';
import { User } from '../database/entities/user.entity';
export declare class ReviewsService {
    private reviewRepo;
    private appRepo;
    private completionRepo;
    private bloggerRepo;
    private brandRepo;
    constructor(reviewRepo: Repository<Review>, appRepo: Repository<Application>, completionRepo: Repository<CompletionRecord>, bloggerRepo: Repository<BloggerProfile>, brandRepo: Repository<BrandProfile>);
    canReview(user: User, applicationId: string): Promise<{
        canReview: boolean;
        reason: string;
    }>;
    create(author: User, dto: {
        applicationId: string;
        rating: number;
        comment?: string;
    }): Promise<{
        id: string;
        rating: number;
        comment: string;
        author: {
            id: string;
            fullName: string;
            avatarUrl: string;
        };
        createdAt: Date;
    }>;
    getByUser(userId: string, page?: number, size?: number): Promise<{
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
    }>;
    private recalculateRating;
    format(r: Review): {
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
}
