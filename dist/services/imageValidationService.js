"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageValidationService = void 0;
const sharp_1 = __importDefault(require("sharp"));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const convert = require('heic-convert');
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
const types_1 = require("../types");
const helpers_1 = require("../utils/helpers");
const blurDetectionService_1 = require("./blurDetectionService");
const faceDetectionService_1 = require("./faceDetectionService");
const duplicateDetectionService_1 = require("./duplicateDetectionService");
class ImageValidationService {
    async validateFormat(filename, mimeType) {
        const ext = filename.toLowerCase();
        const validExtensions = ['.jpg', '.jpeg', '.png', '.heic', '.heif'];
        const hasValidExt = validExtensions.some((e) => ext.endsWith(e));
        const hasValidMime = config_1.config.upload.allowedMimeTypes.includes(mimeType);
        if (!hasValidExt && !hasValidMime) {
            return { passed: false, reason: types_1.RejectionReason.INVALID_FORMAT };
        }
        return { passed: true };
    }
    async convertHeicIfNeeded(buffer, filename, mimeType) {
        if (!(0, helpers_1.isHeicFile)(filename, mimeType)) {
            return { buffer, mimeType, converted: false };
        }
        try {
            const outputBuffer = await convert({
                buffer,
                format: 'JPEG',
                quality: 0.92,
            });
            return {
                buffer: Buffer.from(outputBuffer),
                mimeType: 'image/jpeg',
                converted: true,
            };
        }
        catch (error) {
            logger_1.logger.error('HEIC conversion failed, trying sharp', error);
            const outputBuffer = await (0, sharp_1.default)(buffer).jpeg({ quality: 92 }).toBuffer();
            return {
                buffer: outputBuffer,
                mimeType: 'image/jpeg',
                converted: true,
            };
        }
    }
    async getImageMetadata(buffer) {
        const metadata = await (0, sharp_1.default)(buffer).metadata();
        if (!metadata.width || !metadata.height) {
            throw new Error('Unable to read image dimensions');
        }
        return { width: metadata.width, height: metadata.height };
    }
    async validateResolution(width, height) {
        if (width < config_1.config.validation.minImageDimension ||
            height < config_1.config.validation.minImageDimension) {
            return { passed: false, reason: types_1.RejectionReason.INVALID_RESOLUTION };
        }
        return { passed: true, width, height };
    }
    async runFullValidation(buffer, filename, mimeType, excludeImageId) {
        const formatResult = await this.validateFormat(filename, mimeType);
        if (!formatResult.passed)
            return formatResult;
        let processedBuffer;
        let processedMimeType;
        try {
            const converted = await this.convertHeicIfNeeded(buffer, filename, mimeType);
            processedBuffer = converted.buffer;
            processedMimeType = converted.mimeType;
        }
        catch {
            return { passed: false, reason: types_1.RejectionReason.CORRUPTED_IMAGE };
        }
        let width;
        let height;
        try {
            const metadata = await this.getImageMetadata(processedBuffer);
            width = metadata.width;
            height = metadata.height;
        }
        catch {
            return { passed: false, reason: types_1.RejectionReason.CORRUPTED_IMAGE };
        }
        const resolutionResult = await this.validateResolution(width, height);
        if (!resolutionResult.passed)
            return resolutionResult;
        const blurResult = await blurDetectionService_1.blurDetectionService.detectBlur(processedBuffer);
        if (blurResult.isBlurry) {
            return { passed: false, reason: types_1.RejectionReason.BLURRY_IMAGE, width, height };
        }
        const faceResult = await faceDetectionService_1.faceDetectionService.detectFaces(processedBuffer, width, height);
        if (!faceResult.passed) {
            return { passed: false, reason: faceResult.reason, width, height };
        }
        let hash;
        try {
            hash = await duplicateDetectionService_1.duplicateDetectionService.generateHash(processedBuffer);
        }
        catch {
            return { passed: false, reason: types_1.RejectionReason.CORRUPTED_IMAGE, width, height };
        }
        const duplicateResult = await duplicateDetectionService_1.duplicateDetectionService.findDuplicate(hash, excludeImageId);
        if (duplicateResult.isDuplicate) {
            return { passed: false, reason: types_1.RejectionReason.DUPLICATE_IMAGE, width, height, hash };
        }
        return {
            passed: true,
            width,
            height,
            hash,
            processedBuffer,
            processedMimeType,
        };
    }
}
exports.imageValidationService = new ImageValidationService();
//# sourceMappingURL=imageValidationService.js.map