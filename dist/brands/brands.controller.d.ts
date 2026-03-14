import { BrandsService } from './brands.service';
import { User } from '../database/entities/user.entity';
export declare class BrandsController {
    private brandsService;
    constructor(brandsService: BrandsService);
    getAll(page?: number, size?: number): Promise<{
        success: boolean;
        message: string;
        data: {
            content: {
                id: string;
                fullName: string;
                companyName: string;
                avatarUrl: string;
                city: string;
                country: string;
                verified: boolean;
                description: string;
                websiteUrl: string;
                category: string;
                rating: number;
                tasksCount: number;
                reviewsCount: number;
                socialAccounts: any[];
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
    getOne(userId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            fullName: string;
            companyName: string;
            avatarUrl: string;
            city: string;
            country: string;
            verified: boolean;
            description: string;
            websiteUrl: string;
            category: string;
            rating: number;
            tasksCount: number;
            reviewsCount: number;
            socialAccounts: any[];
        };
        errors: any;
    }>;
    update(user: User, dto: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            fullName: string;
            companyName: string;
            avatarUrl: string;
            city: string;
            country: string;
            verified: boolean;
            description: string;
            websiteUrl: string;
            category: string;
            rating: number;
            tasksCount: number;
            reviewsCount: number;
            socialAccounts: any[];
        };
        errors: any;
    }>;
}
