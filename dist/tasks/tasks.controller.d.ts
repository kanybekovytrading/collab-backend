import { TasksService } from './tasks.service';
import { User } from '../database/entities/user.entity';
export declare class TasksController {
    private tasksService;
    constructor(tasksService: TasksService);
    getAll(query: any): Promise<{
        success: boolean;
        message: string;
        data: {
            content: any[];
            page: number;
            size: number;
            totalElements: number;
            totalPages: number;
            first: boolean;
            last: boolean;
        };
        errors: any;
    }>;
    getOne(id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            title: string;
            description: string;
            taskType: import("../database/entities/task.entity").TaskType;
            coverImageUrl: string;
            city: string;
            online: boolean;
            deadlineDays: number;
            price: number;
            priceDescription: string;
            status: import("../database/entities/task.entity").TaskStatus;
            reactionsCount: number;
            acceptsUgc: boolean;
            acceptsAi: boolean;
            genderFilter: string[];
            categories: string[];
            createdAt: Date;
            brand: {
                id: string;
                fullName: string;
                companyName: any;
                avatarUrl: string;
                verified: boolean;
                rating: any;
            };
        };
        errors: any;
    }>;
    getMy(user: User, page?: number, size?: number): Promise<{
        success: boolean;
        message: string;
        data: {
            content: any[];
            page: number;
            size: number;
            totalElements: number;
            totalPages: number;
            first: boolean;
            last: boolean;
        };
        errors: any;
    }>;
    create(user: User, dto: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            title: string;
            description: string;
            taskType: import("../database/entities/task.entity").TaskType;
            coverImageUrl: string;
            city: string;
            online: boolean;
            deadlineDays: number;
            price: number;
            priceDescription: string;
            status: import("../database/entities/task.entity").TaskStatus;
            reactionsCount: number;
            acceptsUgc: boolean;
            acceptsAi: boolean;
            genderFilter: string[];
            categories: string[];
            createdAt: Date;
            brand: {
                id: string;
                fullName: string;
                companyName: any;
                avatarUrl: string;
                verified: boolean;
                rating: any;
            };
        };
        errors: any;
    }>;
    delete(id: string, user: User): Promise<{
        success: boolean;
        message: string;
        data: any;
        errors: any;
    }>;
}
