import { Worker, Job } from 'bullmq';
import { ImageStatus } from '../services/imageService';
import { config } from '../config';
import { s3Service } from '../services/s3Service';
import { imageValidationService } from '../services/imageValidationService';
import { imageService } from '../services/imageService';
import { faceDetectionService } from '../services/faceDetectionService';
import { JobType, ImageValidationJobData, RejectionReason } from '../types';
import { logger } from '../utils/logger';
import { generateS3Key } from '../utils/helpers';
import { connectDatabase, disconnectDatabase } from '../utils/mongodb';

async function processImageValidation(
  job: Job<ImageValidationJobData>,
): Promise<void> {
  const { imageId, s3Key, filename, mimeType } = job.data;
  logger.info(`Processing validation for image ${imageId}`);

  await imageService.updateStatus(imageId, ImageStatus.PROCESSING);

  try {
    const buffer = await s3Service.downloadFile(
      config.s3.bucketOriginal,
      s3Key,
    );

    const result = await imageValidationService.runFullValidation(
      buffer,
      filename,
      mimeType,
      imageId,
    );

    if (!result.passed) {
      await imageService.updateStatus(imageId, ImageStatus.REJECTED, {
        rejectionReason: result.reason,
        width: result.width,
        height: result.height,
        hash: result.hash,
      });
      logger.info(`Image ${imageId} rejected: ${result.reason}`);
      return;
    }

    let processedUrl: string | undefined;
    if (result.processedBuffer && result.processedMimeType) {
      const processedKey = generateS3Key(
        filename.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'),
      );
      processedUrl = await s3Service.uploadFile(
        config.s3.bucketProcessed,
        processedKey,
        result.processedBuffer,
        result.processedMimeType,
      );
    }

    await imageService.updateStatus(imageId, ImageStatus.ACCEPTED, {
      processedUrl,
      width: result.width,
      height: result.height,
      hash: result.hash,
    });

    logger.info(`Image ${imageId} accepted`);
  } catch (error) {
    logger.error(`Validation failed for image ${imageId}`, error);
    await imageService.updateStatus(imageId, ImageStatus.REJECTED, {
      rejectionReason: RejectionReason.PROCESSING_ERROR,
    });
    throw error;
  }
}

const connection = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
};

let imageValidationWorker: Worker<ImageValidationJobData>;

function createWorker(): Worker<ImageValidationJobData> {
  const worker = new Worker<ImageValidationJobData>(
    JobType.IMAGE_VALIDATION,
    processImageValidation,
    {
      connection,
      concurrency: 5,
      limiter: {
        max: 10,
        duration: 1000,
      },
    },
  );

  worker.on('completed', (job) => {
    logger.debug(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed`, err);
  });

  worker.on('error', (err) => {
    logger.error('Worker error', err);
  });

  return worker;
}

async function shutdown(): Promise<void> {
  logger.info('Shutting down worker...');
  if (imageValidationWorker) {
    await imageValidationWorker.close();
  }
  await faceDetectionService.dispose();
  await disconnectDatabase();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

async function bootstrap(): Promise<void> {
  await connectDatabase();
  imageValidationWorker = createWorker();
  logger.info('Image validation worker started');
  await faceDetectionService.loadModels();
}

if (require.main === module) {
  bootstrap().catch((err) => {
    logger.error('Failed to start worker', err);
    process.exit(1);
  });
}

export { processImageValidation };
