export enum RejectionReason {
  INVALID_FORMAT = 'Invalid file format. Only JPG, JPEG, PNG, and HEIC are accepted.',
  INVALID_RESOLUTION = 'Invalid Resolution',
  BLURRY_IMAGE = 'Blurry Image',
  NO_FACE_DETECTED = 'No Face Detected',
  MULTIPLE_FACES = 'Multiple Faces Detected',
  FACE_TOO_SMALL = 'Face Too Small',
  DUPLICATE_IMAGE = 'Duplicate Image',
  CORRUPTED_IMAGE = 'Corrupted or unreadable image',
  PROCESSING_ERROR = 'An error occurred during image processing',
}

export enum JobType {
  IMAGE_VALIDATION = 'IMAGE_VALIDATION',
}

export interface ImageValidationJobData {
  imageId: string;
  s3Key: string;
  filename: string;
  mimeType: string;
}

export interface ValidationResult {
  passed: boolean;
  reason?: RejectionReason;
  width?: number;
  height?: number;
  hash?: string;
  processedBuffer?: Buffer;
  processedMimeType?: string;
}

export interface FaceDetectionResult {
  faceCount: number;
  largestFaceAreaPercent: number;
  passed: boolean;
  reason?: RejectionReason;
}

export interface BlurDetectionResult {
  variance: number;
  isBlurry: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
