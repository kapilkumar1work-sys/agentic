"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageValidationQueueEvents = exports.imageValidationQueue = void 0;
exports.addImageValidationJob = addImageValidationJob;
exports.closeQueues = closeQueues;
const bullmq_1 = require("bullmq");
const config_1 = require("../config");
const types_1 = require("../types");
const logger_1 = require("../utils/logger");
const connection = {
    host: config_1.config.redis.host,
    port: config_1.config.redis.port,
    password: config_1.config.redis.password,
};
exports.imageValidationQueue = new bullmq_1.Queue(types_1.JobType.IMAGE_VALIDATION, {
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
});
exports.imageValidationQueueEvents = new bullmq_1.QueueEvents(types_1.JobType.IMAGE_VALIDATION, { connection });
async function addImageValidationJob(data) {
    const job = await exports.imageValidationQueue.add(types_1.JobType.IMAGE_VALIDATION, data, {
        jobId: `validation-${data.imageId}`,
    });
    logger_1.logger.info(`Queued validation job for image ${data.imageId}`);
    return job.id ?? data.imageId;
}
async function closeQueues() {
    await exports.imageValidationQueue.close();
    await exports.imageValidationQueueEvents.close();
}
//# sourceMappingURL=imageValidationQueue.js.map