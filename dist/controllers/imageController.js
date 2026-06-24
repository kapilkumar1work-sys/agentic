"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.getImageStatus = exports.getImageById = exports.getImages = exports.uploadImage = void 0;
const imageService_1 = require("../services/imageService");
const imageService_2 = require("../services/imageService");
const imageValidationQueue_1 = require("../queues/imageValidationQueue");
const errorHandler_1 = require("../middleware/errorHandler");
exports.uploadImage = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        throw new errorHandler_1.AppError(400, 'No file uploaded');
    }
    const { originalname, buffer, mimetype, size } = req.file;
    const { image, s3Key } = await imageService_2.imageService.create({
        filename: originalname,
        buffer,
        mimeType: mimetype,
        fileSize: size,
    });
    await (0, imageValidationQueue_1.addImageValidationJob)({
        imageId: image.id,
        s3Key,
        filename: originalname,
        mimeType: mimetype,
    });
    const response = {
        success: true,
        data: image,
        message: 'Image uploaded successfully. Processing has been queued.',
    };
    res.status(201).json(response);
});
exports.getImages = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const status = req.query.status;
    if (status && !Object.values(imageService_1.ImageStatus).includes(status)) {
        throw new errorHandler_1.AppError(400, 'Invalid status filter');
    }
    const result = await imageService_2.imageService.findAll(page, limit, status);
    res.json({ success: true, data: result });
});
exports.getImageById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const id = String(req.params.id);
    const image = await imageService_2.imageService.findById(id);
    if (!image) {
        throw new errorHandler_1.AppError(404, 'Image not found');
    }
    res.json({ success: true, data: image });
});
exports.getImageStatus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const id = String(req.params.id);
    const image = await imageService_2.imageService.findById(id);
    if (!image) {
        throw new errorHandler_1.AppError(404, 'Image not found');
    }
    res.json({
        success: true,
        data: {
            id: image.id,
            status: image.status,
            rejectionReason: image.rejectionReason,
        },
    });
});
exports.deleteImage = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const id = String(req.params.id);
    const image = await imageService_2.imageService.findById(id);
    if (!image) {
        throw new errorHandler_1.AppError(404, 'Image not found');
    }
    await imageService_2.imageService.delete(id);
    res.json({ success: true, message: 'Image deleted successfully' });
});
//# sourceMappingURL=imageController.js.map