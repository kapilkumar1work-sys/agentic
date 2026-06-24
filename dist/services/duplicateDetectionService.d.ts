declare class DuplicateDetectionService {
    generateHash(imageBuffer: Buffer): Promise<string>;
    findDuplicate(hash: string, excludeImageId?: string): Promise<{
        isDuplicate: boolean;
        similarImageId?: string;
        similarity?: number;
    }>;
}
export declare const duplicateDetectionService: DuplicateDetectionService;
export {};
//# sourceMappingURL=duplicateDetectionService.d.ts.map