import { Repository } from 'typeorm';
import { BrandProfile } from '../database/entities/brand-profile.entity';
export declare class BrandsService {
    private brandRepo;
    constructor(brandRepo: Repository<BrandProfile>);
    findAll(page?: number, size?: number): Promise<{
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
    }>;
    findOne(userId: string): Promise<{
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
    }>;
    update(userId: string, dto: any): Promise<{
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
    }>;
    format(b: BrandProfile): {
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
}
