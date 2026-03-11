export declare enum Role {
    BLOGGER = "BLOGGER",
    AI_CREATOR = "AI_CREATOR",
    BRAND = "BRAND",
    ADMIN = "ADMIN"
}
export declare class User {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    password: string;
    roles: Role[];
    currentRole: string;
    verified: boolean;
    active: boolean;
    avatarUrl: string;
    city: string;
    country: string;
    fcmToken: string;
    createdAt: Date;
    updatedAt: Date;
}
