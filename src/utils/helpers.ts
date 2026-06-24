import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const SAFE_FILENAME_REGEX = /^[a-zA-Z0-9._-]+$/;

export function sanitizeFilename(filename: string): string {
  const basename = path.basename(filename);
  const sanitized = basename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return sanitized.slice(0, 255);
}

export function generateS3Key(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const safeName = sanitizeFilename(path.basename(filename, ext));
  const uniqueId = uuidv4();
  return `images/${uniqueId}/${safeName}${ext}`;
}

export function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

export function isHeicFile(filename: string, mimeType: string): boolean {
  const ext = getFileExtension(filename);
  return (
    ext === '.heic' ||
    ext === '.heif' ||
    mimeType === 'image/heic' ||
    mimeType === 'image/heif'
  );
}

export function isAllowedExtension(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ['.jpg', '.jpeg', '.png', '.heic', '.heif'].includes(ext);
}

export function validateFilename(filename: string): boolean {
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return false;
  }
  const basename = path.basename(filename);
  return SAFE_FILENAME_REGEX.test(basename) || basename.replace(/[^a-zA-Z0-9._-]/g, '').length > 0;
}

export function hammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) {
    return Infinity;
  }
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) {
      distance++;
    }
  }
  return distance;
}

export function hashSimilarityPercent(hash1: string, hash2: string): number {
  if (!hash1 || !hash2 || hash1.length !== hash2.length) {
    return 0;
  }
  const distance = hammingDistance(hash1, hash2);
  const maxBits = hash1.length * 4;
  return ((maxBits - distance) / maxBits) * 100;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
