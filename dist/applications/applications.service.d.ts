import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from '../database/entities/application.entity';
import { Task } from '../database/entities/task.entity';
import { BloggerProfile } from '../database/entities/blogger-profile.entity';
import { BrandProfile } from '../database/entities/brand-profile.entity';
import { CompletionRecord } from '../database/entities/completion-record.entity';
import { User } from '../database/entities/user.entity';
export declare class ApplicationsService {
    private appRepo;
    private taskRepo;
    private bloggerRepo;
    private brandRepo;
    private completionRepo;
    constructor(appRepo: Repository<Application>, taskRepo: Repository<Task>, bloggerRepo: Repository<BloggerProfile>, brandRepo: Repository<BrandProfile>, completionRepo: Repository<CompletionRecord>);
    apply(user: User, dto: {
        taskId: string;
        coverLetter?: string;
        proposedPrice?: number;
    }): Promise<{
        id: string;
        status: ApplicationStatus;
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
    }>;
    invite(brandUser: User, dto: {
        taskId: string;
        bloggerId: string;
    }): Promise<void>;
    getByTask(brandUser: User, taskId: string, page?: number, size?: number): Promise<{
        content: any[];
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
        first: boolean;
        last: boolean;
    }>;
    getMy(userId: string, page?: number, size?: number): Promise<{
        content: any[];
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
        first: boolean;
        last: boolean;
    }>;
    accept(brandUser: User, id: string): Promise<void>;
    reject(brandUser: User, id: string): Promise<void>;
    cancel(user: User, id: string): Promise<void>;
    submit(userId: string, id: string, dto: {
        workUrl?: string;
        comment?: string;
    }): Promise<void>;
    requestRevision(brandUser: User, id: string, dto: {
        comment?: string;
    }): Promise<void>;
    approve(brandUser: User, id: string): Promise<void>;
    private getApp;
    format(a: Application): {
        id: string;
        status: ApplicationStatus;
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
    private paginate;
}
