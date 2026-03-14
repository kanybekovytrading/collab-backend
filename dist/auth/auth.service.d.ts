import { OnApplicationBootstrap } from '@nestjs/common';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../database/entities/user.entity';
import { BloggerProfile } from '../database/entities/blogger-profile.entity';
import { BrandProfile } from '../database/entities/brand-profile.entity';
import { RegisterDto, LoginDto, OAuthDto, InstagramLoginDto } from './auth.dto';
export declare class AuthService implements OnApplicationBootstrap {
    private userRepo;
    private bloggerRepo;
    private brandRepo;
    private jwtService;
    private cfg;
    constructor(userRepo: Repository<User>, bloggerRepo: Repository<BloggerProfile>, brandRepo: Repository<BrandProfile>, jwtService: JwtService, cfg: ConfigService);
    private generateTokens;
    private formatUser;
    register(dto: RegisterDto): Promise<{
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
    }>;
    login(dto: LoginDto): Promise<{
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
    }>;
    refresh(refreshToken: string): Promise<{
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
    }>;
    oauthLogin(dto: OAuthDto): Promise<{
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
    }>;
    instagramLogin(dto: InstagramLoginDto): Promise<{
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
    }>;
    seedAdmin(): Promise<{
        message: string;
    }>;
    onApplicationBootstrap(): Promise<void>;
    adminLogin(email: string, password: string): Promise<{
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
    }>;
    private createProfile;
}
