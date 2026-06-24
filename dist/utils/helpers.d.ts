export declare function sanitizeFilename(filename: string): string;
export declare function generateS3Key(filename: string): string;
export declare function getFileExtension(filename: string): string;
export declare function isHeicFile(filename: string, mimeType: string): boolean;
export declare function isAllowedExtension(filename: string): boolean;
export declare function validateFilename(filename: string): boolean;
export declare function hammingDistance(hash1: string, hash2: string): number;
export declare function hashSimilarityPercent(hash1: string, hash2: string): number;
export declare function sleep(ms: number): Promise<void>;
//# sourceMappingURL=helpers.d.ts.map