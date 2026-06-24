import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3001', 10),
  apiPrefix: process.env.API_PREFIX ?? '/api',

  database: {
    url: requireEnv('DATABASE_URL'),
  },

  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  s3: {
    region: process.env.AWS_REGION ?? 'us-east-1',
    accessKeyId: requireEnv('AWS_ACCESS_KEY_ID', 'minioadmin'),
    secretAccessKey: requireEnv('AWS_SECRET_ACCESS_KEY', 'minioadmin'),
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    bucketOriginal: requireEnv('S3_BUCKET_ORIGINAL', 'uploads-original'),
    bucketProcessed: requireEnv('S3_BUCKET_PROCESSED', 'uploads-processed'),
    presignedUrlExpiry: parseInt(process.env.S3_PRESIGNED_URL_EXPIRY ?? '3600', 10),
  },

  upload: {
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB ?? '25', 10),
    maxFileSizeBytes: parseInt(process.env.MAX_FILE_SIZE_MB ?? '25', 10) * 1024 * 1024,
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/heic',
      'image/heif',
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.heic', '.heif'],
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? '100', 10),
  },

  validation: {
    minImageDimension: parseInt(process.env.MIN_IMAGE_DIMENSION ?? '512', 10),
    faceMinAreaPercent: parseInt(process.env.FACE_MIN_AREA_PERCENT ?? '15', 10),
    blurThreshold: parseInt(process.env.BLUR_THRESHOLD ?? '100', 10),
    duplicateSimilarityThreshold: parseInt(
      process.env.DUPLICATE_SIMILARITY_THRESHOLD ?? '95',
      10,
    ),
  },

  faceApi: {
    modelsPath: process.env.FACE_API_MODELS_PATH ?? './models',
  },
} as const;
