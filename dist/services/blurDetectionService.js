"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blurDetectionService = void 0;
const sharp_1 = __importDefault(require("sharp"));
const config_1 = require("../config");
class BlurDetectionService {
    async detectBlur(imageBuffer) {
        const { data, info } = await (0, sharp_1.default)(imageBuffer)
            .greyscale()
            .raw()
            .toBuffer({ resolveWithObject: true });
        const variance = this.calculateLaplacianVariance(data, info.width, info.height);
        return {
            variance,
            isBlurry: variance < config_1.config.validation.blurThreshold,
        };
    }
    calculateLaplacianVariance(pixels, width, height) {
        const laplacianKernel = [0, 1, 0, 1, -4, 1, 0, 1, 0];
        const laplacianValues = [];
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let sum = 0;
                let ki = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const pixelIndex = (y + ky) * width + (x + kx);
                        sum += pixels[pixelIndex] * laplacianKernel[ki];
                        ki++;
                    }
                }
                laplacianValues.push(sum);
            }
        }
        if (laplacianValues.length === 0)
            return 0;
        const mean = laplacianValues.reduce((a, b) => a + b, 0) / laplacianValues.length;
        const variance = laplacianValues.reduce((sum, val) => sum + (val - mean) ** 2, 0) /
            laplacianValues.length;
        return variance;
    }
}
exports.blurDetectionService = new BlurDetectionService();
//# sourceMappingURL=blurDetectionService.js.map