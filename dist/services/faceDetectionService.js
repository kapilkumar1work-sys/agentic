"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.faceDetectionService = void 0;
const path_1 = __importDefault(require("path"));
const faceapi = __importStar(require("face-api.js"));
const tf = __importStar(require("@tensorflow/tfjs-node"));
const sharp_1 = __importDefault(require("sharp"));
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
const types_1 = require("../types");
class FaceDetectionService {
    modelsLoaded = false;
    loadingPromise = null;
    async loadModels() {
        if (this.modelsLoaded)
            return;
        if (this.loadingPromise)
            return this.loadingPromise;
        this.loadingPromise = this._loadModels();
        return this.loadingPromise;
    }
    async _loadModels() {
        try {
            const modelsPath = path_1.default.resolve(config_1.config.faceApi.modelsPath);
            await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
            this.modelsLoaded = true;
            logger_1.logger.info('Face detection models loaded successfully');
        }
        catch (error) {
            logger_1.logger.error('Failed to load face detection models', error);
            throw error;
        }
    }
    async bufferToTensor(imageBuffer, width, height) {
        const { data } = await (0, sharp_1.default)(imageBuffer)
            .resize(width, height, { fit: 'fill' })
            .removeAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });
        return tf.tensor3d(new Uint8Array(data), [height, width, 3]);
    }
    async detectFaces(imageBuffer, imageWidth, imageHeight) {
        await this.loadModels();
        let tensor = null;
        try {
            tensor = await this.bufferToTensor(imageBuffer, imageWidth, imageHeight);
            const detections = await faceapi.detectAllFaces(tensor);
            const faceCount = detections.length;
            const imageArea = imageWidth * imageHeight;
            if (faceCount === 0) {
                return {
                    faceCount: 0,
                    largestFaceAreaPercent: 0,
                    passed: false,
                    reason: types_1.RejectionReason.NO_FACE_DETECTED,
                };
            }
            if (faceCount > 1) {
                return {
                    faceCount,
                    largestFaceAreaPercent: 0,
                    passed: false,
                    reason: types_1.RejectionReason.MULTIPLE_FACES,
                };
            }
            const face = detections[0];
            const box = face.box;
            const faceArea = box.width * box.height;
            const faceAreaPercent = (faceArea / imageArea) * 100;
            if (faceAreaPercent < config_1.config.validation.faceMinAreaPercent) {
                return {
                    faceCount,
                    largestFaceAreaPercent: faceAreaPercent,
                    passed: false,
                    reason: types_1.RejectionReason.FACE_TOO_SMALL,
                };
            }
            return {
                faceCount,
                largestFaceAreaPercent: faceAreaPercent,
                passed: true,
            };
        }
        finally {
            if (tensor) {
                tensor.dispose();
            }
        }
    }
    async dispose() {
        tf.disposeVariables();
    }
}
exports.faceDetectionService = new FaceDetectionService();
//# sourceMappingURL=faceDetectionService.js.map