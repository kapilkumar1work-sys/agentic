import { Worker, Job } from 'bullmq';
import { ImageValidationJobData } from '../types';
declare function processImageValidation(job: Job<ImageValidationJobData>): Promise<void>;
export declare const imageValidationWorker: Worker<ImageValidationJobData, any, string>;
export { processImageValidation };
//# sourceMappingURL=imageValidationWorker.d.ts.map