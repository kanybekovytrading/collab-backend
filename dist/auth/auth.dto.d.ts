export declare enum Role {
    BLOGGER = "BLOGGER",
    AI_CREATOR = "AI_CREATOR",
    BRAND = "BRAND",
    ADMIN = "ADMIN"
}
export declare class RegisterDto {
    fullName: string;
    email: string;
    password: string;
    role: Role;
    phone?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RefreshDto {
    refreshToken: string;
}
export declare class OAuthDto {
    firebaseToken: string;
    role: Role;
}
export declare class InstagramLoginDto {
    code: string;
    redirectUri: string;
    role: Role;
}
