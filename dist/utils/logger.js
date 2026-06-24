"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const config_1 = require("../config");
const { combine, timestamp, printf, colorize, errors } = winston_1.default.format;
const logFormat = printf(({ level, message, timestamp: ts, stack }) => {
    return `${ts} [${level}]: ${stack ?? message}`;
});
exports.logger = winston_1.default.createLogger({
    level: config_1.config.env === 'production' ? 'info' : 'debug',
    format: combine(errors({ stack: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
    transports: [
        new winston_1.default.transports.Console({
            format: combine(colorize(), logFormat),
        }),
    ],
});
//# sourceMappingURL=logger.js.map