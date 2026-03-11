import { ConfigService } from '@nestjs/config';
export declare class MediaService {
    private cfg;
    private s3;
    private bucket;
    constructor(cfg: ConfigService);
    upload(type: string, entityId: string, file: Express.Multer.File): Promise<{
        fileId: string;
        objectKey: string;
        presignedUrl: string;
        contentType: string;
        sizeBytes: number;
    }>;
    getPresignedUrl(objectKey: string): Promise<string>;
}
