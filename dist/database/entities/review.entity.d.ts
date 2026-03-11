import { User } from './user.entity';
import { Application } from './application.entity';
export declare class Review {
    id: string;
    author: User;
    target: User;
    application: Application;
    rating: number;
    comment: string;
    createdAt: Date;
}
