import { Collection, ObjectId, WithId } from 'mongodb';
export declare enum ImageStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED"
}
export interface ImageDocument {
    filename: string;
    originalUrl: string;
    processedUrl?: string | null;
    fileType: string;
    fileSize: number;
    width?: number | null;
    height?: number | null;
    status: ImageStatus;
    rejectionReason?: string | null;
    hash?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare function connectDatabase(): Promise<void>;
export declare function getImagesCollection(): Collection<ImageDocument>;
export declare function toObjectId(id: string): ObjectId;
export declare function isValidObjectId(id: string): boolean;
export type StoredImage = WithId<ImageDocument>;
export declare function disconnectDatabase(): Promise<void>;
//# sourceMappingURL=mongodb.d.ts.map