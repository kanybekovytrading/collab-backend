import { ConfigService } from '@nestjs/config';
import { MediaService } from './media.service';
export declare class MediaController {
    private mediaService;
    private cfg;
    constructor(mediaService: MediaService, cfg: ConfigService);
    upload(type: string, entityId: string, file: Express.Multer.File): Promise<{
        success: boolean;
        message: string;
        data: import("./media.service").UploadResult;
        errors: any;
    }>;
    signedUrl(fileId: string, resourceType?: 'image' | 'video'): {
        success: boolean;
        message: string;
        data: string;
        errors: any;
    };
    getUploadSignature(type: string, entityId: string): {
        success: boolean;
        message: string;
        data: {
            signature: string;
            timestamp: number;
            apiKey: any;
            cloudName: any;
            folder: string;
            eager: string;
            eagerAsync: boolean;
            eagerNotificationUrl: any;
        };
        errors: any;
    };
    cloudinaryWebhook(body: any, signature: string, timestamp: string): {
        received: boolean;
    };
    private verifyWebhookSignature;
}
