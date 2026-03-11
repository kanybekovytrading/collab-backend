import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Task, TaskStatus } from '../database/entities/task.entity';
import { Application } from '../database/entities/application.entity';
import { BloggerProfile } from '../database/entities/blogger-profile.entity';
import { BrandProfile } from '../database/entities/brand-profile.entity';
import { CompletionRecord } from '../database/entities/completion-record.entity';
export declare class AdminService {
    private userRepo;
    private taskRepo;
    private appRepo;
    private bloggerRepo;
    private brandRepo;
    private completionRepo;
    constructor(userRepo: Repository<User>, taskRepo: Repository<Task>, appRepo: Repository<Application>, bloggerRepo: Repository<BloggerProfile>, brandRepo: Repository<BrandProfile>, completionRepo: Repository<CompletionRecord>);
    getUsers(search?: string, page?: number, size?: number): Promise<{
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
    }>;
    banUser(id: string, active: boolean): Promise<{
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
    }>;
    verifyUser(id: string, verified: boolean): Promise<{
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
    }>;
    getTasks(status?: string, search?: string, page?: number, size?: number): Promise<{
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
    }>;
    verifyTask(id: string, status: TaskStatus): Promise<{
        id: string;
        title: string;
        description: string;
        taskType: import("../database/entities/task.entity").TaskType;
        status: TaskStatus;
        brandName: string;
        brandEmail: string;
        createdAt: Date;
    }>;
    restoreTask(id: string): Promise<{
        id: string;
        title: string;
        description: string;
        taskType: import("../database/entities/task.entity").TaskType;
        status: TaskStatus;
        brandName: string;
        brandEmail: string;
        createdAt: Date;
    }>;
    deleteTask(id: string, reason?: string): Promise<void>;
    getStats(): Promise<{
        totalUsers: number;
        totalBloggers: number;
        totalBrands: number;
        totalTasks: number;
        activeTasks: number;
        completedCollaborations: number;
        totalApplications: number;
        generatedAt: Date;
    }>;
    formatUser(u: User): {
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
    formatTask(t: Task): {
        id: string;
        title: string;
        description: string;
        taskType: import("../database/entities/task.entity").TaskType;
        status: TaskStatus;
        brandName: string;
        brandEmail: string;
        createdAt: Date;
    };
}
