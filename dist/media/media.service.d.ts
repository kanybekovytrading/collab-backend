import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export interface UploadResult {
    fileId: string;
    url: string;
    hlsUrl: null;
    status: 'ready';
    contentType: string;
    sizeBytes: number;
}
export interface PresignedUploadResult {
    uploadUrl: string;
    publicUrl: string;
    fileId: string;
    expiresIn: number;
}
export declare class MediaService implements OnModuleInit {
    private cfg;
    private readonly s3;
    private readonly bucket;
    private readonly publicBase;
    private readonly appUrl;
    onModuleInit(): Promise<void>;
    private setBucketPublicPolicy;
    constructor(cfg: ConfigService);
    upload(type: string, entityId: string, file: Express.Multer.File): Promise<UploadResult>;
    getPresignedUpload(type: string, entityId: string, contentType: string, sizeBytes: number): Promise<PresignedUploadResult>;
    delete(fileId: string): Promise<void>;
    exists(fileId: string): Promise<boolean>;
    getPublicUrl(fileId: string): string;
    getPresignedReadUrl(fileId: string, expiresIn?: number): Promise<string>;
    private getExt;
    private getMimeExt;
}
