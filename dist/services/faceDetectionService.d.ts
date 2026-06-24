import { FaceDetectionResult } from '../types';
declare class FaceDetectionService {
    private modelsLoaded;
    private loadingPromise;
    loadModels(): Promise<void>;
    private _loadModels;
    private bufferToTensor;
    detectFaces(imageBuffer: Buffer, imageWidth: number, imageHeight: number): Promise<FaceDetectionResult>;
    dispose(): Promise<void>;
}
export declare const faceDetectionService: FaceDetectionService;
export {};
//# sourceMappingURL=faceDetectionService.d.ts.map