"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const imageController_1 = require("../controllers/imageController");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.post('/upload', upload_1.upload.single('image'), upload_1.validateFileContent, imageController_1.uploadImage);
router.get('/', imageController_1.getImages);
router.get('/status/:id', imageController_1.getImageStatus);
router.get('/:id', imageController_1.getImageById);
router.delete('/:id', imageController_1.deleteImage);
exports.default = router;
//# sourceMappingURL=imageRoutes.js.map