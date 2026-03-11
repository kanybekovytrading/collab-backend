import { User } from './user.entity';
import { PortfolioItem } from './portfolio-item.entity';
export declare class BloggerProfile {
    id: string;
    user: User;
    bio: string;
    categories: string[];
    minPrice: number;
    worksWithBarter: boolean;
    rating: number;
    completedTasksCount: number;
    reviewsCount: number;
    socialAccounts: any[];
    age: number;
    portfolioItems: PortfolioItem[];
    createdAt: Date;
    updatedAt: Date;
}
