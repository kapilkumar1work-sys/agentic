import { Queue, QueueEvents } from 'bullmq';
import { ImageValidationJobData } from '../types';
export declare const imageValidationQueue: Queue<ImageValidationJobData, any, string, ImageValidationJobData, any, string>;
export declare const imageValidationQueueEvents: QueueEvents;
export declare function addImageValidationJob(data: ImageValidationJobData): Promise<string>;
export declare function closeQueues(): Promise<void>;
//# sourceMappingURL=imageValidationQueue.d.ts.map