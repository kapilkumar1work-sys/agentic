"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUploadedFile = validateUploadedFile;
const config_1 = require("../config");
const helpers_1 = require("../utils/helpers");
function validateUploadedFile(filename, mimeType, size) {
    if (!filename || filename.includes('..')) {
        return { valid: false, error: 'Invalid filename' };
    }
    if (!(0, helpers_1.isAllowedExtension)(filename)) {
        return {
            valid: false,
            error: 'Invalid file type. Only JPG, JPEG, PNG, and HEIC are allowed.',
        };
    }
    const normalizedMime = mimeType.toLowerCase();
    const mimeAllowed = config_1.config.upload.allowedMimeTypes.includes(normalizedMime) ||
        normalizedMime === 'application/octet-stream';
    if (!mimeAllowed) {
        return { valid: false, error: `Invalid MIME type: ${mimeType}` };
    }
    if (size > config_1.config.upload.maxFileSizeBytes) {
        return {
            valid: false,
            error: `File exceeds maximum size of ${config_1.config.upload.maxFileSizeMb}MB`,
        };
    }
    if (size === 0) {
        return { valid: false, error: 'File is empty' };
    }
    return { valid: true };
}
//# sourceMappingURL=fileValidator.js.map