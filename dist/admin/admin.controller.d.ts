import { AdminService } from './admin.service';
import { TaskStatus } from '../database/entities/task.entity';
declare class VerifyTaskDto {
    status: TaskStatus;
}
declare class BanUserDto {
    active: boolean;
    reason?: string;
}
declare class VerifyUserDto {
    verified: boolean;
}
declare class DeleteTaskDto {
    reason?: string;
}
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
    getUsers(search?: string, page?: number, size?: number): Promise<{
        success: boolean;
        message: string;
        data: {
            content: {
                id: string;
                fullName: string;
                email: string;
                phone: string;
                roles: import("../database/entities/user.entity").Role[];
                currentRole: string;
                verified: boolean;
                active: boolean;
                city: string;
                country: string;
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
    banUser(id: string, dto: BanUserDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
            roles: import("../database/entities/user.entity").Role[];
            currentRole: string;
            verified: boolean;
            active: boolean;
            city: string;
            country: string;
            createdAt: Date;
        };
        errors: any;
    }>;
    verifyUser(id: string, dto: VerifyUserDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
            roles: import("../database/entities/user.entity").Role[];
            currentRole: string;
            verified: boolean;
            active: boolean;
            city: string;
            country: string;
            createdAt: Date;
        };
        errors: any;
    }>;
    getTasks(status?: string, search?: string, page?: number, size?: number): Promise<{
        success: boolean;
        message: string;
        data: {
            content: {
                id: string;
                title: string;
                description: string;
                taskType: import("../database/entities/task.entity").TaskType;
                status: TaskStatus;
                brandName: string;
                brandEmail: string;
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
    verifyTask(id: string, dto: VerifyTaskDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            title: string;
            description: string;
            taskType: import("../database/entities/task.entity").TaskType;
            status: TaskStatus;
            brandName: string;
            brandEmail: string;
            createdAt: Date;
        };
        errors: any;
    }>;
    restoreTask(id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            title: string;
            description: string;
            taskType: import("../database/entities/task.entity").TaskType;
            status: TaskStatus;
            brandName: string;
            brandEmail: string;
            createdAt: Date;
        };
        errors: any;
    }>;
    deleteTask(id: string, dto: DeleteTaskDto): Promise<{
        success: boolean;
        message: string;
        data: any;
        errors: any;
    }>;
    getStats(): Promise<{
        success: boolean;
        message: string;
        data: {
            totalUsers: number;
            totalBloggers: number;
            totalBrands: number;
            totalTasks: number;
            activeTasks: number;
            completedCollaborations: number;
            totalApplications: number;
            generatedAt: Date;
        };
        errors: any;
    }>;
}
export {};
