import { ConfigService } from '@nestjs/config';
export declare class SocialService {
    private cfg;
    constructor(cfg: ConfigService);
    validate(platform: string, username?: string): Promise<{
        platform: string;
        username: string;
        exists: boolean;
        followersCount: number;
        requiresOAuth: boolean;
    }>;
    getOAuthUrl(platform: string): {
        authUrl: string;
        platform: string;
    };
    handleCallback(platform: string, code: string, state: string): Promise<{
        platform: string;
        code: string;
        state: string;
    }>;
}
