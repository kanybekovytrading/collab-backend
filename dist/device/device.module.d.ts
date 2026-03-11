import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
export declare class DeviceController {
    private userRepo;
    constructor(userRepo: Repository<User>);
    updateFcmToken(user: User, dto: {
        token: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: any;
        errors: any;
    }>;
}
export declare class DeviceModule {
}
