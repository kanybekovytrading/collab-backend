import { MediaService } from './media.service';
export declare class MediaController {
    private mediaService;
    constructor(mediaService: MediaService);
    upload(type: string, entityId: string, file: Express.Multer.File): Promise<{
        success: boolean;
        message: string;
        data: {
            fileId: string;
            objectKey: string;
            presignedUrl: string;
            contentType: string;
            sizeBytes: number;
        };
        errors: any;
    }>;
    presigned(objectKey: string): Promise<{
        success: boolean;
        message: string;
        data: string;
        errors: any;
    }>;
}
