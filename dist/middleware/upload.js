"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
exports.validateFileContent = validateFileContent;
const multer_1 = __importDefault(require("multer"));
const config_1 = require("../config");
const errorHandler_1 = require("./errorHandler");
const helpers_1 = require("../utils/helpers");
const ALLOWED_MAGIC_BYTES = {
    'image/jpeg': [[0xff, 0xd8, 0xff]],
    'image/png': [[0x89, 0x50, 0x4e, 0x47]],
    'image/heic': [
        [0x00, 0x00, 0x00],
    ],
};
function validateMagicBytes(buffer, mimeType) {
    const signatures = ALLOWED_MAGIC_BYTES[mimeType];
    if (!signatures) {
        const ext = mimeType.includes('heic') || mimeType.includes('heif');
        if (ext) {
            const ftypOffset = buffer.indexOf('ftyp');
            return ftypOffset >= 4 && ftypOffset <= 12;
        }
        return false;
    }
    return signatures.some((sig) => sig.every((byte, i) => buffer[i] === byte));
}
const storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: config_1.config.upload.maxFileSizeBytes,
        files: 10,
    },
    fileFilter: (_req, file, cb) => {
        if (!(0, helpers_1.isAllowedExtension)(file.originalname)) {
            cb(new errorHandler_1.AppError(400, 'Invalid file type. Only JPG, JPEG, PNG, and HEIC are allowed.'));
            return;
        }
        const normalizedMime = file.mimetype.toLowerCase();
        const isAllowedMime = config_1.config.upload.allowedMimeTypes.includes(normalizedMime) ||
            normalizedMime === 'application/octet-stream';
        if (!isAllowedMime) {
            cb(new errorHandler_1.AppError(400, `Invalid MIME type: ${file.mimetype}`));
            return;
        }
        cb(null, true);
    },
});
function validateFileContent(req, _res, next) {
    if (!req.file) {
        next(new errorHandler_1.AppError(400, 'No file uploaded'));
        return;
    }
    const buffer = req.file.buffer;
    const mimeType = req.file.mimetype.toLowerCase();
    if (buffer.length < 12) {
        next(new errorHandler_1.AppError(400, 'File is too small or corrupted'));
        return;
    }
    const isHeic = mimeType.includes('heic') ||
        mimeType.includes('heif') ||
        req.file.originalname.toLowerCase().endsWith('.heic') ||
        req.file.originalname.toLowerCase().endsWith('.heif');
    if (isHeic) {
        const ftypOffset = buffer.indexOf('ftyp');
        if (ftypOffset < 4 || ftypOffset > 12) {
            next(new errorHandler_1.AppError(400, 'Invalid HEIC file'));
            return;
        }
    }
    else if (!validateMagicBytes(buffer, mimeType)) {
        next(new errorHandler_1.AppError(400, 'File content does not match declared type'));
        return;
    }
    next();
}
//# sourceMappingURL=upload.js.map