import { ConfigService } from '@nestjs/config';
export interface UploadResult {
    fileId: string;
    url: string;
    hlsUrl: string | null;
    status: 'ready' | 'processing';
    contentType: string;
    sizeBytes: number;
}
export declare class MediaService {
    private cfg;
    constructor(cfg: ConfigService);
    upload(type: string, entityId: string, file: Express.Multer.File): Promise<UploadResult>;
    getUploadSignature(type: string, entityId: string): {
        signature: string;
        timestamp: number;
        apiKey: any;
        cloudName: any;
        folder: string;
        eager: string;
        eagerAsync: boolean;
        eagerNotificationUrl: any;
    };
    handleVideoReady(publicId: string): {
        fileId: string;
        hlsUrl: string;
    };
    getSignedUrl(publicId: string, resourceType?: 'image' | 'video'): string;
    private uploadToCloudinary;
}
