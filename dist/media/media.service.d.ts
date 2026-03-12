import { ConfigService } from '@nestjs/config';
export declare class MediaService {
    private cfg;
    constructor(cfg: ConfigService);
    upload(type: string, entityId: string, file: Express.Multer.File): Promise<{
        fileId: string;
        objectKey: string;
        presignedUrl: string;
        contentType: string;
        sizeBytes: number;
    }>;
    getPresignedUrl(objectKey: string): Promise<string>;
    private uploadToCloudinary;
}
