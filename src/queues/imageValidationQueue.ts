import { Queue, QueueEvents } from 'bullmq';
import { config } from '../config';
import { JobType, ImageValidationJobData } from '../types';
import { logger } from '../utils/logger';

const connection = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
};

export const imageValidationQueue = new Queue<ImageValidationJobData>(
  JobType.IMAGE_VALIDATION,
  {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 5000 },
    },
  },
);

export const imageValidationQueueEvents = new QueueEvents(
  JobType.IMAGE_VALIDATION,
  { connection },
);

export async function addImageValidationJob(
  data: ImageValidationJobData,
): Promise<string> {
  const job = await imageValidationQueue.add(JobType.IMAGE_VALIDATION, data, {
    jobId: `validation-${data.imageId}`,
  });
  logger.info(`Queued validation job for image ${data.imageId}`);
  return job.id ?? data.imageId;
}

export async function closeQueues(): Promise<void> {
  await imageValidationQueue.close();
  await imageValidationQueueEvents.close();
}
