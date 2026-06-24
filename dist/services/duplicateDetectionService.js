"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.duplicateDetectionService = void 0;
const image_hash_1 = require("image-hash");
const util_1 = require("util");
const mongodb_1 = require("../utils/mongodb");
const config_1 = require("../config");
const helpers_1 = require("../utils/helpers");
const logger_1 = require("../utils/logger");
const hashImage = (0, util_1.promisify)(image_hash_1.imageHash);
class DuplicateDetectionService {
    async generateHash(imageBuffer) {
        return hashImage(imageBuffer, 16, true);
    }
    async findDuplicate(hash, excludeImageId) {
        const existingImages = await (0, mongodb_1.getImagesCollection)()
            .find({
            hash: { $ne: null },
            status: { $in: [mongodb_1.ImageStatus.ACCEPTED, mongodb_1.ImageStatus.PENDING, mongodb_1.ImageStatus.PROCESSING] },
            ...(excludeImageId && { _id: { $ne: (0, mongodb_1.toObjectId)(excludeImageId) } }),
        })
            .project({ _id: 1, hash: 1 })
            .limit(10000)
            .toArray();
        for (const existing of existingImages) {
            if (!existing.hash)
                continue;
            const similarity = (0, helpers_1.hashSimilarityPercent)(hash, existing.hash);
            if (similarity > config_1.config.validation.duplicateSimilarityThreshold) {
                logger_1.logger.debug(`Duplicate detected: ${similarity.toFixed(2)}% similar to ${existing._id.toString()}`);
                return {
                    isDuplicate: true,
                    similarImageId: existing._id.toString(),
                    similarity,
                };
            }
        }
        return { isDuplicate: false };
    }
}
exports.duplicateDetectionService = new DuplicateDetectionService();
//# sourceMappingURL=duplicateDetectionService.js.map