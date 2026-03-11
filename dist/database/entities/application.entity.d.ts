import { User } from './user.entity';
import { Task } from './task.entity';
export declare enum ApplicationStatus {
    PENDING = "PENDING",
    IN_WORK = "IN_WORK",
    SUBMITTED = "SUBMITTED",
    REVISION_REQUESTED = "REVISION_REQUESTED",
    COMPLETED = "COMPLETED",
    REJECTED = "REJECTED",
    CANCELLED = "CANCELLED"
}
export declare class Application {
    id: string;
    blogger: User;
    task: Task;
    status: ApplicationStatus;
    coverLetter: string;
    proposedPrice: number;
    invited: boolean;
    workUrl: string;
    revisionComment: string;
    revisionCount: number;
    createdAt: Date;
    updatedAt: Date;
}
