import { BloggerProfile } from './blogger-profile.entity';
export declare class PortfolioItem {
    id: string;
    blogger: BloggerProfile;
    mediaUrl: string;
    title: string;
    contentType: string;
    thumbnailUrl: string;
    sortOrder: number;
    createdAt: Date;
}
