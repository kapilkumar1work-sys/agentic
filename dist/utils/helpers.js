"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeFilename = sanitizeFilename;
exports.generateS3Key = generateS3Key;
exports.getFileExtension = getFileExtension;
exports.isHeicFile = isHeicFile;
exports.isAllowedExtension = isAllowedExtension;
exports.validateFilename = validateFilename;
exports.hammingDistance = hammingDistance;
exports.hashSimilarityPercent = hashSimilarityPercent;
exports.sleep = sleep;
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const SAFE_FILENAME_REGEX = /^[a-zA-Z0-9._-]+$/;
function sanitizeFilename(filename) {
    const basename = path_1.default.basename(filename);
    const sanitized = basename.replace(/[^a-zA-Z0-9._-]/g, '_');
    return sanitized.slice(0, 255);
}
function generateS3Key(filename) {
    const ext = path_1.default.extname(filename).toLowerCase();
    const safeName = sanitizeFilename(path_1.default.basename(filename, ext));
    const uniqueId = (0, uuid_1.v4)();
    return `images/${uniqueId}/${safeName}${ext}`;
}
function getFileExtension(filename) {
    return path_1.default.extname(filename).toLowerCase();
}
function isHeicFile(filename, mimeType) {
    const ext = getFileExtension(filename);
    return (ext === '.heic' ||
        ext === '.heif' ||
        mimeType === 'image/heic' ||
        mimeType === 'image/heif');
}
function isAllowedExtension(filename) {
    const ext = getFileExtension(filename);
    return ['.jpg', '.jpeg', '.png', '.heic', '.heif'].includes(ext);
}
function validateFilename(filename) {
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return false;
    }
    const basename = path_1.default.basename(filename);
    return SAFE_FILENAME_REGEX.test(basename) || basename.replace(/[^a-zA-Z0-9._-]/g, '').length > 0;
}
function hammingDistance(hash1, hash2) {
    if (hash1.length !== hash2.length) {
        return Infinity;
    }
    let distance = 0;
    for (let i = 0; i < hash1.length; i++) {
        if (hash1[i] !== hash2[i]) {
            distance++;
        }
    }
    return distance;
}
function hashSimilarityPercent(hash1, hash2) {
    if (!hash1 || !hash2 || hash1.length !== hash2.length) {
        return 0;
    }
    const distance = hammingDistance(hash1, hash2);
    const maxBits = hash1.length * 4;
    return ((maxBits - distance) / maxBits) * 100;
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
//# sourceMappingURL=helpers.js.map