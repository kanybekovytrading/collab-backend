import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshDto, OAuthDto, InstagramLoginDto } from './auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        success: boolean;
        message: string;
        data: {
            user: {
                id: string;
                fullName: string;
                email: string;
                phone: string;
                currentRole: string;
                avatarUrl: string;
                verified: boolean;
            };
            accessToken: string;
            refreshToken: string;
        };
        errors: any;
    }>;
    login(dto: LoginDto): Promise<{
        success: boolean;
        message: string;
        data: {
            user: {
                id: string;
                fullName: string;
                email: string;
                phone: string;
                currentRole: string;
                avatarUrl: string;
                verified: boolean;
            };
            accessToken: string;
            refreshToken: string;
        };
        errors: any;
    }>;
    refresh(dto: RefreshDto): Promise<{
        success: boolean;
        message: string;
        data: {
            user: {
                id: string;
                fullName: string;
                email: string;
                phone: string;
                currentRole: string;
                avatarUrl: string;
                verified: boolean;
            };
            accessToken: string;
            refreshToken: string;
        };
        errors: any;
    }>;
    oauth(dto: OAuthDto): Promise<{
        success: boolean;
        message: string;
        data: {
            user: {
                id: string;
                fullName: string;
                email: string;
                phone: string;
                currentRole: string;
                avatarUrl: string;
                verified: boolean;
            };
            accessToken: string;
            refreshToken: string;
        };
        errors: any;
    }>;
    instagram(dto: InstagramLoginDto): Promise<{
        success: boolean;
        message: string;
        data: {
            user: {
                id: string;
                fullName: string;
                email: string;
                phone: string;
                currentRole: string;
                avatarUrl: string;
                verified: boolean;
            };
            accessToken: string;
            refreshToken: string;
        };
        errors: any;
    }>;
}
