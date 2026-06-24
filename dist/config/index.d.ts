export declare const config: {
    readonly env: string;
    readonly port: number;
    readonly apiPrefix: string;
    readonly database: {
        readonly url: string;
    };
    readonly redis: {
        readonly host: string;
        readonly port: number;
        readonly password: string | undefined;
    };
    readonly s3: {
        readonly region: string;
        readonly accessKeyId: string;
        readonly secretAccessKey: string;
        readonly endpoint: string | undefined;
        readonly forcePathStyle: boolean;
        readonly bucketOriginal: string;
        readonly bucketProcessed: string;
        readonly presignedUrlExpiry: number;
    };
    readonly upload: {
        readonly maxFileSizeMb: number;
        readonly maxFileSizeBytes: number;
        readonly allowedMimeTypes: readonly ["image/jpeg", "image/jpg", "image/png", "image/heic", "image/heif"];
        readonly allowedExtensions: readonly [".jpg", ".jpeg", ".png", ".heic", ".heif"];
    };
    readonly rateLimit: {
        readonly windowMs: number;
        readonly maxRequests: number;
    };
    readonly validation: {
        readonly minImageDimension: number;
        readonly faceMinAreaPercent: number;
        readonly blurThreshold: number;
        readonly duplicateSimilarityThreshold: number;
    };
    readonly faceApi: {
        readonly modelsPath: string;
    };
};
//# sourceMappingURL=index.d.ts.map