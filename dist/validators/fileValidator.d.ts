export interface FileValidationResult {
    valid: boolean;
    error?: string;
}
export declare function validateUploadedFile(filename: string, mimeType: string, size: number): FileValidationResult;
//# sourceMappingURL=fileValidator.d.ts.map