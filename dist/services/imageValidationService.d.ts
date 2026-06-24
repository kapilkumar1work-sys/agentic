import { ValidationResult } from '../types';
declare class ImageValidationService {
    validateFormat(filename: string, mimeType: string): Promise<ValidationResult>;
    convertHeicIfNeeded(buffer: Buffer, filename: string, mimeType: string): Promise<{
        buffer: Buffer;
        mimeType: string;
        converted: boolean;
    }>;
    getImageMetadata(buffer: Buffer): Promise<{
        width: number;
        height: number;
    }>;
    validateResolution(width: number, height: number): Promise<ValidationResult>;
    runFullValidation(buffer: Buffer, filename: string, mimeType: string, excludeImageId?: string): Promise<ValidationResult>;
}
export declare const imageValidationService: ImageValidationService;
export {};
//# sourceMappingURL=imageValidationService.d.ts.map