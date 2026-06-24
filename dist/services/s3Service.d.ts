declare class S3Service {
    private client;
    constructor();
    ensureBucketsExist(): Promise<void>;
    uploadFile(bucket: string, key: string, body: Buffer, contentType: string, metadata?: Record<string, string>): Promise<string>;
    downloadFile(bucket: string, key: string): Promise<Buffer>;
    deleteFile(bucket: string, key: string): Promise<void>;
    getPresignedUrl(bucket: string, key: string): Promise<string>;
    extractKeyFromUrl(url: string): string | null;
}
export declare const s3Service: S3Service;
export {};
//# sourceMappingURL=s3Service.d.ts.map