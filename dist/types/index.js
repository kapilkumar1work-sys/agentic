"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobType = exports.RejectionReason = void 0;
var RejectionReason;
(function (RejectionReason) {
    RejectionReason["INVALID_FORMAT"] = "Invalid file format. Only JPG, JPEG, PNG, and HEIC are accepted.";
    RejectionReason["INVALID_RESOLUTION"] = "Invalid Resolution";
    RejectionReason["BLURRY_IMAGE"] = "Blurry Image";
    RejectionReason["NO_FACE_DETECTED"] = "No Face Detected";
    RejectionReason["MULTIPLE_FACES"] = "Multiple Faces Detected";
    RejectionReason["FACE_TOO_SMALL"] = "Face Too Small";
    RejectionReason["DUPLICATE_IMAGE"] = "Duplicate Image";
    RejectionReason["CORRUPTED_IMAGE"] = "Corrupted or unreadable image";
    RejectionReason["PROCESSING_ERROR"] = "An error occurred during image processing";
})(RejectionReason || (exports.RejectionReason = RejectionReason = {}));
var JobType;
(function (JobType) {
    JobType["IMAGE_VALIDATION"] = "IMAGE_VALIDATION";
})(JobType || (exports.JobType = JobType = {}));
//# sourceMappingURL=index.js.map