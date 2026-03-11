import { ApplicationsService } from './applications.service';
import { User } from '../database/entities/user.entity';
export declare class ApplicationsController {
    private appsService;
    constructor(appsService: ApplicationsService);
    apply(user: User, dto: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            status: import("../database/entities/application.entity").ApplicationStatus;
            coverLetter: string;
            proposedPrice: number;
            invited: boolean;
            workUrl: string;
            revisionComment: string;
            revisionCount: number;
            createdAt: Date;
            blogger: {
                id: string;
                fullName: string;
                avatarUrl: string;
            };
            task: {
                id: string;
                title: string;
            };
        };
        errors: any;
    }>;
    invite(user: User, dto: any): Promise<{
        success: boolean;
        message: string;
        data: any;
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
    getByTask(user: User, taskId: string, page?: number, size?: number): Promise<{
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
    accept(user: User, id: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        errors: any;
    }>;
    reject(user: User, id: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        errors: any;
    }>;
    cancel(user: User, id: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        errors: any;
    }>;
    submit(user: User, id: string, dto: any): Promise<{
        success: boolean;
        message: string;
        data: any;
        errors: any;
    }>;
    revision(user: User, id: string, dto: any): Promise<{
        success: boolean;
        message: string;
        data: any;
        errors: any;
    }>;
    approve(user: User, id: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        errors: any;
    }>;
}
