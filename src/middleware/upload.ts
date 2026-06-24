import multer from 'multer';
import { Request } from 'express';
import { config } from '../config';
import { AppError } from './errorHandler';
import { isAllowedExtension } from '../utils/helpers';

const ALLOWED_MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47]],
  'image/heic': [
    [0x00, 0x00, 0x00],
  ],
};

function detectImageType(buffer: Buffer, filename: string): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'image/png';
  }

  const lower = filename.toLowerCase();
  if (lower.endsWith('.heic') || lower.endsWith('.heif')) {
    const ftypOffset = buffer.indexOf('ftyp');
    if (ftypOffset >= 4 && ftypOffset <= 12) {
      return 'image/heic';
    }
  }

  return null;
}

function validateMagicBytes(buffer: Buffer, mimeType: string, filename: string): boolean {
  const detected = detectImageType(buffer, filename);
  if (detected) {
    return mimeType === 'application/octet-stream' || mimeType === '' || detected === mimeType || mimeType.includes(detected.split('/')[1]);
  }

  const signatures = ALLOWED_MAGIC_BYTES[mimeType];
  if (!signatures) {
    const ext = mimeType.includes('heic') || mimeType.includes('heif');
    if (ext) {
      const ftypOffset = buffer.indexOf('ftyp');
      return ftypOffset >= 4 && ftypOffset <= 12;
    }
    return false;
  }

  return signatures.some((sig) =>
    sig.every((byte, i) => buffer[i] === byte),
  );
}

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSizeBytes,
    files: 10,
  },
  fileFilter: (_req: Request, file, cb) => {
    if (!isAllowedExtension(file.originalname)) {
      cb(new AppError(400, 'Invalid file type. Only JPG, JPEG, PNG, and HEIC are allowed.'));
      return;
    }

    const normalizedMime = file.mimetype.toLowerCase();
    const isAllowedMime =
      (config.upload.allowedMimeTypes as readonly string[]).includes(normalizedMime) ||
      normalizedMime === 'application/octet-stream';

    if (!isAllowedMime) {
      cb(new AppError(400, `Invalid MIME type: ${file.mimetype}`));
      return;
    }

    cb(null, true);
  },
});

export function validateFileContent(
  req: Request,
  _res: unknown,
  next: (err?: Error) => void,
): void {
  if (!req.file) {
    next(new AppError(400, 'No file uploaded'));
    return;
  }

  const buffer = req.file.buffer;
  const mimeType = req.file.mimetype.toLowerCase();

  if (buffer.length < 12) {
    next(new AppError(400, 'File is too small or corrupted'));
    return;
  }

  const isHeic =
    mimeType.includes('heic') ||
    mimeType.includes('heif') ||
    req.file.originalname.toLowerCase().endsWith('.heic') ||
    req.file.originalname.toLowerCase().endsWith('.heif');

  if (isHeic) {
    const ftypOffset = buffer.indexOf('ftyp');
    if (ftypOffset < 4 || ftypOffset > 12) {
      next(new AppError(400, 'Invalid HEIC file'));
      return;
    }
  } else if (!validateMagicBytes(buffer, mimeType, req.file.originalname)) {
    next(new AppError(400, 'File content does not match declared type'));
    return;
  }

  next();
}
