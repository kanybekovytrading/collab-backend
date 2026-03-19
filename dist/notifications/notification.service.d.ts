export declare class NotificationService {
    private readonly logger;
    send(fcmToken: string | null | undefined, title: string, body: string, data?: Record<string, string>): Promise<void>;
    sendToMany(fcmTokens: string[], title: string, body: string, data?: Record<string, string>): Promise<void>;
}
