"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageStatus = exports.imageService = void 0;
const mongodb_1 = require("../utils/mongodb");
Object.defineProperty(exports, "ImageStatus", { enumerable: true, get: function () { return mongodb_1.ImageStatus; } });
const config_1 = require("../config");
const s3Service_1 = require("./s3Service");
const helpers_1 = require("../utils/helpers");
class ImageService {
    async create(input) {
        const s3Key = (0, helpers_1.generateS3Key)(input.filename);
        const originalUrl = await s3Service_1.s3Service.uploadFile(config_1.config.s3.bucketOriginal, s3Key, input.buffer, input.mimeType, { originalFilename: input.filename });
        const now = new Date();
        const result = await (0, mongodb_1.getImagesCollection)().insertOne({
            filename: input.filename,
            originalUrl,
            fileType: input.mimeType,
            fileSize: input.fileSize,
            status: mongodb_1.ImageStatus.PENDING,
            createdAt: now,
            updatedAt: now,
        });
        const image = await (0, mongodb_1.getImagesCollection)().findOne({ _id: result.insertedId });
        if (!image) {
            throw new Error('Failed to create image record');
        }
        return { image: this.toResponse(image), s3Key };
    }
    async findById(id) {
        const image = await (0, mongodb_1.getImagesCollection)().findOne({ _id: (0, mongodb_1.toObjectId)(id) });
        if (!image)
            return null;
        return this.toResponse(image);
    }
    async findAll(page = 1, limit = 20, status) {
        const filter = status ? { status } : {};
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            (0, mongodb_1.getImagesCollection)()
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray(),
            (0, mongodb_1.getImagesCollection)().countDocuments(filter),
        ]);
        return {
            items: items.map((img) => this.toResponse(img)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async updateStatus(id, status, data) {
        const result = await (0, mongodb_1.getImagesCollection)().findOneAndUpdate({ _id: (0, mongodb_1.toObjectId)(id) }, { $set: { status, ...data, updatedAt: new Date() } }, { returnDocument: 'after' });
        if (!result) {
            throw new Error(`Image not found: ${id}`);
        }
        return this.toResponse(result);
    }
    async delete(id) {
        const image = await (0, mongodb_1.getImagesCollection)().findOne({ _id: (0, mongodb_1.toObjectId)(id) });
        if (!image)
            return;
        const originalKey = s3Service_1.s3Service.extractKeyFromUrl(image.originalUrl);
        if (originalKey) {
            await s3Service_1.s3Service.deleteFile(config_1.config.s3.bucketOriginal, originalKey).catch(() => { });
        }
        if (image.processedUrl) {
            const processedKey = s3Service_1.s3Service.extractKeyFromUrl(image.processedUrl);
            if (processedKey) {
                await s3Service_1.s3Service.deleteFile(config_1.config.s3.bucketProcessed, processedKey).catch(() => { });
            }
        }
        await (0, mongodb_1.getImagesCollection)().deleteOne({ _id: (0, mongodb_1.toObjectId)(id) });
    }
    toResponse(image) {
        return {
            id: image._id.toString(),
            filename: image.filename,
            originalUrl: image.originalUrl,
            processedUrl: image.processedUrl ?? null,
            fileType: image.fileType,
            fileSize: image.fileSize,
            width: image.width ?? null,
            height: image.height ?? null,
            status: image.status,
            rejectionReason: image.rejectionReason ?? null,
            hash: image.hash ?? null,
            createdAt: image.createdAt,
            updatedAt: image.updatedAt,
        };
    }
}
exports.imageService = new ImageService();
//# sourceMappingURL=imageService.js.map