import { SocialService } from './social.service';
export declare class SocialController {
    private socialService;
    constructor(socialService: SocialService);
    validate(platform: string, username?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            platform: string;
            username: string;
            exists: boolean;
            followersCount: number;
            requiresOAuth: boolean;
        };
        errors: any;
    }>;
    connect(platform: string): Promise<{
        success: boolean;
        message: string;
        data: {
            authUrl: string;
            platform: string;
        };
        errors: any;
    }>;
    callback(platform: string, code: string, state: string): Promise<{
        platform: string;
        code: string;
        state: string;
    }>;
}
