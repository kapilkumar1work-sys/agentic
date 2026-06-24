"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageValidationWorker = void 0;
exports.processImageValidation = processImageValidation;
const bullmq_1 = require("bullmq");
const imageService_1 = require("../services/imageService");
const config_1 = require("../config");
const s3Service_1 = require("../services/s3Service");
const imageValidationService_1 = require("../services/imageValidationService");
const imageService_2 = require("../services/imageService");
const faceDetectionService_1 = require("../services/faceDetectionService");
const types_1 = require("../types");
const logger_1 = require("../utils/logger");
const helpers_1 = require("../utils/helpers");
async function processImageValidation(job) {
    const { imageId, s3Key, filename, mimeType } = job.data;
    logger_1.logger.info(`Processing validation for image ${imageId}`);
    await imageService_2.imageService.updateStatus(imageId, imageService_1.ImageStatus.PROCESSING);
    try {
        const buffer = await s3Service_1.s3Service.downloadFile(config_1.config.s3.bucketOriginal, s3Key);
        const result = await imageValidationService_1.imageValidationService.runFullValidation(buffer, filename, mimeType, imageId);
        if (!result.passed) {
            await imageService_2.imageService.updateStatus(imageId, imageService_1.ImageStatus.REJECTED, {
                rejectionReason: result.reason,
                width: result.width,
                height: result.height,
                hash: result.hash,
            });
            logger_1.logger.info(`Image ${imageId} rejected: ${result.reason}`);
            return;
        }
        let processedUrl;
        if (result.processedBuffer && result.processedMimeType) {
            const processedKey = (0, helpers_1.generateS3Key)(filename.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'));
            processedUrl = await s3Service_1.s3Service.uploadFile(config_1.config.s3.bucketProcessed, processedKey, result.processedBuffer, result.processedMimeType);
        }
        await imageService_2.imageService.updateStatus(imageId, imageService_1.ImageStatus.ACCEPTED, {
            processedUrl,
            width: result.width,
            height: result.height,
            hash: result.hash,
        });
        logger_1.logger.info(`Image ${imageId} accepted`);
    }
    catch (error) {
        logger_1.logger.error(`Validation failed for image ${imageId}`, error);
        await imageService_2.imageService.updateStatus(imageId, imageService_1.ImageStatus.REJECTED, {
            rejectionReason: types_1.RejectionReason.PROCESSING_ERROR,
        });
        throw error;
    }
}
const connection = {
    host: config_1.config.redis.host,
    port: config_1.config.redis.port,
    password: config_1.config.redis.password,
};
exports.imageValidationWorker = new bullmq_1.Worker(types_1.JobType.IMAGE_VALIDATION, processImageValidation, {
    connection,
    concurrency: 5,
    limiter: {
        max: 10,
        duration: 1000,
    },
});
exports.imageValidationWorker.on('completed', (job) => {
    logger_1.logger.debug(`Job ${job.id} completed`);
});
exports.imageValidationWorker.on('failed', (job, err) => {
    logger_1.logger.error(`Job ${job?.id} failed`, err);
});
exports.imageValidationWorker.on('error', (err) => {
    logger_1.logger.error('Worker error', err);
});
async function shutdown() {
    logger_1.logger.info('Shutting down worker...');
    await exports.imageValidationWorker.close();
    await faceDetectionService_1.faceDetectionService.dispose();
    process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
if (require.main === module) {
    logger_1.logger.info('Image validation worker started');
    faceDetectionService_1.faceDetectionService.loadModels().catch((err) => {
        logger_1.logger.error('Failed to preload face detection models', err);
    });
}
//# sourceMappingURL=imageValidationWorker.js.map