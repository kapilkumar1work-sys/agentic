"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = require("./config");
const security_1 = require("./middleware/security");
const errorHandler_1 = require("./middleware/errorHandler");
const imageRoutes_1 = __importDefault(require("./routes/imageRoutes"));
const mongodb_1 = require("./utils/mongodb");
const s3Service_1 = require("./services/s3Service");
const logger_1 = require("./utils/logger");
const imageValidationQueue_1 = require("./queues/imageValidationQueue");
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: '1mb' }));
app.use(...security_1.securityMiddleware);
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use(`${config_1.config.apiPrefix}/images`, imageRoutes_1.default);
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
async function bootstrap() {
    await (0, mongodb_1.connectDatabase)();
    await s3Service_1.s3Service.ensureBucketsExist();
    const server = app.listen(config_1.config.port, () => {
        logger_1.logger.info(`API server running on port ${config_1.config.port}`);
        logger_1.logger.info(`Environment: ${config_1.config.env}`);
    });
    const shutdown = async (signal) => {
        logger_1.logger.info(`${signal} received, shutting down gracefully`);
        server.close(async () => {
            await (0, imageValidationQueue_1.closeQueues)();
            await (0, mongodb_1.disconnectDatabase)();
            process.exit(0);
        });
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}
bootstrap().catch((err) => {
    logger_1.logger.error('Failed to start server', err);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=index.js.map