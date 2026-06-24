"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityMiddleware = void 0;
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("../config");
exports.securityMiddleware = [
    (0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: false,
    }),
    (0, cors_1.default)({
        origin: process.env.CORS_ORIGIN ?? ['http://localhost:5173', 'http://localhost:3000'],
        methods: ['GET', 'POST', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    }),
    (0, express_rate_limit_1.default)({
        windowMs: config_1.config.rateLimit.windowMs,
        max: config_1.config.rateLimit.maxRequests,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            error: 'Too many requests, please try again later.',
        },
    }),
];
//# sourceMappingURL=security.js.map