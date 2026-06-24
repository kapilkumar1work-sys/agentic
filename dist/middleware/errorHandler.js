"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
exports.asyncHandler = asyncHandler;
const logger_1 = require("../utils/logger");
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
function errorHandler(err, _req, res, _next) {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
        });
        return;
    }
    logger_1.logger.error('Unhandled error', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
    });
}
function notFoundHandler(_req, res) {
    res.status(404).json({
        success: false,
        error: 'Resource not found',
    });
}
function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}
//# sourceMappingURL=errorHandler.js.map