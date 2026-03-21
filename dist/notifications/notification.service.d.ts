export declare class NotificationService {
    private readonly logger;
    private readonly expo;
    send(token: string | null | undefined, title: string, body: string, data?: Record<string, string>): Promise<void>;
    sendToMany(tokens: string[], title: string, body: string, data?: Record<string, string>): Promise<void>;
}
