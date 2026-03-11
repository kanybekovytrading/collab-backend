import { UsersService } from './users.service';
import { User, Role } from '../database/entities/user.entity';
declare class AddRoleDto {
    role: Role;
}
declare class SwitchRoleDto {
    role: Role;
}
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    addRole(user: User, dto: AddRoleDto): Promise<{
        success: boolean;
        message: string;
        data: {
            currentRole: string;
            allRoles: Role[];
        };
        errors: any;
    }>;
    switchRole(user: User, dto: SwitchRoleDto): Promise<{
        success: boolean;
        message: string;
        data: {
            currentRole: string;
            allRoles: Role[];
        };
        errors: any;
    }>;
}
export {};
