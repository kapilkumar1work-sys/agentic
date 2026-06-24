import { ImageStatus } from '../utils/mongodb';
import { PaginatedResponse } from '../types';
export interface CreateImageInput {
    filename: string;
    buffer: Buffer;
    mimeType: string;
    fileSize: number;
}
export interface ImageResponse {
    id: string;
    filename: string;
    originalUrl: string;
    processedUrl: string | null;
    fileType: string;
    fileSize: number;
    width: number | null;
    height: number | null;
    status: ImageStatus;
    rejectionReason: string | null;
    hash: string | null;
    createdAt: Date;
    updatedAt: Date;
}
declare class ImageService {
    create(input: CreateImageInput): Promise<{
        image: ImageResponse;
        s3Key: string;
    }>;
    findById(id: string): Promise<ImageResponse | null>;
    findAll(page?: number, limit?: number, status?: ImageStatus): Promise<PaginatedResponse<ImageResponse>>;
    updateStatus(id: string, status: ImageStatus, data?: Partial<{
        rejectionReason: string;
        processedUrl: string;
        width: number;
        height: number;
        hash: string;
    }>): Promise<ImageResponse>;
    delete(id: string): Promise<void>;
    private toResponse;
}
export declare const imageService: ImageService;
export { ImageStatus };
//# sourceMappingURL=imageService.d.ts.map