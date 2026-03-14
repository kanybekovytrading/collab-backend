import { MediaService } from './media.service';
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    getFile(key: string): Promise<{
        url: string;
        statusCode: number;
    }>;
    presign(type: string, entityId: string, contentType: string, sizeBytes: string): Promise<{
        success: boolean;
        message: string;
        data: import("./media.service").PresignedUploadResult;
        errors: any;
    }>;
    upload(type: string, entityId: string, file: Express.Multer.File): Promise<{
        success: boolean;
        message: string;
        data: import("./media.service").UploadResult;
        errors: any;
    }>;
    delete(fileId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            deleted: boolean;
        };
        errors: any;
    }>;
}
