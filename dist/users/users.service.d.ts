import { Repository } from 'typeorm';
import { User, Role } from '../database/entities/user.entity';
import { BloggerProfile } from '../database/entities/blogger-profile.entity';
import { BrandProfile } from '../database/entities/brand-profile.entity';
export declare class UsersService {
    private userRepo;
    private bloggerRepo;
    private brandRepo;
    constructor(userRepo: Repository<User>, bloggerRepo: Repository<BloggerProfile>, brandRepo: Repository<BrandProfile>);
    addRole(userId: string, role: Role): Promise<{
        currentRole: string;
        allRoles: Role[];
    }>;
    switchRole(userId: string, role: Role): Promise<{
        currentRole: string;
        allRoles: Role[];
    }>;
}
