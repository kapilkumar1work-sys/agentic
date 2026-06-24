import { BlurDetectionResult } from '../types';
declare class BlurDetectionService {
    detectBlur(imageBuffer: Buffer): Promise<BlurDetectionResult>;
    private calculateLaplacianVariance;
}
export declare const blurDetectionService: BlurDetectionService;
export {};
//# sourceMappingURL=blurDetectionService.d.ts.map