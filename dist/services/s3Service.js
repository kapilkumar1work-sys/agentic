"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Service = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
class S3Service {
    client;
    constructor() {
        this.client = new client_s3_1.S3Client({
            region: config_1.config.s3.region,
            credentials: {
                accessKeyId: config_1.config.s3.accessKeyId,
                secretAccessKey: config_1.config.s3.secretAccessKey,
            },
            ...(config_1.config.s3.endpoint && {
                endpoint: config_1.config.s3.endpoint,
                forcePathStyle: config_1.config.s3.forcePathStyle,
            }),
        });
    }
    async ensureBucketsExist() {
        for (const bucket of [config_1.config.s3.bucketOriginal, config_1.config.s3.bucketProcessed]) {
            try {
                await this.client.send(new client_s3_1.HeadBucketCommand({ Bucket: bucket }));
                logger_1.logger.debug(`Bucket ${bucket} exists`);
            }
            catch {
                try {
                    await this.client.send(new client_s3_1.CreateBucketCommand({ Bucket: bucket }));
                    logger_1.logger.info(`Created bucket ${bucket}`);
                }
                catch (error) {
                    logger_1.logger.warn(`Could not create bucket ${bucket}`, error);
                }
            }
        }
    }
    async uploadFile(bucket, key, body, contentType, metadata) {
        const isLocalS3 = Boolean(config_1.config.s3.endpoint);
        await this.client.send(new client_s3_1.PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: contentType,
            Metadata: metadata,
            ...(!isLocalS3 && { ServerSideEncryption: 'AES256' }),
        }));
        return this.getPresignedUrl(bucket, key);
    }
    async downloadFile(bucket, key) {
        const response = await this.client.send(new client_s3_1.GetObjectCommand({ Bucket: bucket, Key: key }));
        if (!response.Body) {
            throw new Error(`Empty response body for key: ${key}`);
        }
        const chunks = [];
        for await (const chunk of response.Body) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks);
    }
    async deleteFile(bucket, key) {
        await this.client.send(new client_s3_1.DeleteObjectCommand({ Bucket: bucket, Key: key }));
    }
    async getPresignedUrl(bucket, key) {
        const command = new client_s3_1.GetObjectCommand({ Bucket: bucket, Key: key });
        return (0, s3_request_presigner_1.getSignedUrl)(this.client, command, {
            expiresIn: config_1.config.s3.presignedUrlExpiry,
        });
    }
    extractKeyFromUrl(url) {
        try {
            const parsed = new URL(url);
            const pathParts = parsed.pathname.split('/').filter(Boolean);
            if (pathParts.length >= 2) {
                return pathParts.slice(1).join('/');
            }
            return pathParts.join('/');
        }
        catch {
            return null;
        }
    }
}
exports.s3Service = new S3Service();
//# sourceMappingURL=s3Service.js.map