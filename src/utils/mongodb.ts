import { MongoClient, Db, Collection, ObjectId, WithId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from '../config';
import { logger } from './logger';

export enum ImageStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export interface ImageDocument {
  filename: string;
  originalUrl: string;
  processedUrl?: string | null;
  fileType: string;
  fileSize: number;
  width?: number | null;
  height?: number | null;
  status: ImageStatus;
  rejectionReason?: string | null;
  hash?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const DEV_MEMORY_PORT = 27018;

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
  memoryServer?: MongoMemoryServer;
};

let db: Db;

async function connectClient(url: string): Promise<MongoClient> {
  const client = new MongoClient(url, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  return client;
}

async function setupIndexes(database: Db): Promise<void> {
  await database.collection('images').createIndex({ status: 1 });
  await database.collection('images').createIndex({ hash: 1 });
  await database.collection('images').createIndex({ createdAt: -1 });
}

async function tryConnect(url: string): Promise<MongoClient | null> {
  try {
    return await connectClient(url);
  } catch {
    return null;
  }
}

async function startSharedMemoryServer(): Promise<string> {
  if (!globalForMongo.memoryServer) {
    globalForMongo.memoryServer = await MongoMemoryServer.create({
      instance: { port: DEV_MEMORY_PORT },
    });
    logger.info(`Started shared in-memory MongoDB on port ${DEV_MEMORY_PORT}`);
  }
  return `mongodb://127.0.0.1:${DEV_MEMORY_PORT}/aragon_images`;
}

export async function connectDatabase(): Promise<void> {
  if (globalForMongo.mongoClient) {
    db = globalForMongo.mongoClient.db();
    return;
  }

  const candidates = [
    config.database.url,
    'mongodb://127.0.0.1:27017/aragon_images',
    `mongodb://127.0.0.1:${DEV_MEMORY_PORT}/aragon_images`,
  ];

  for (const url of candidates) {
    const client = await tryConnect(url);
    if (client) {
      globalForMongo.mongoClient = client;
      db = client.db();
      await setupIndexes(db);
      const label = url.includes('mongodb+srv') ? 'Atlas' : url.includes('27018') ? 'shared memory' : 'local';
      logger.info(`Database connected successfully (${label})`);
      return;
    }
    logger.warn(`MongoDB unavailable: ${url.split('@').pop() ?? url}`);
  }

  if (config.env === 'development') {
    const memoryUrl = await startSharedMemoryServer();
    const client = await tryConnect(memoryUrl);
    if (client) {
      globalForMongo.mongoClient = client;
      db = client.db();
      await setupIndexes(db);
      logger.info('Database connected successfully (in-memory, shared)');
      return;
    }
  }

  throw new Error(
    'Could not connect to MongoDB. Check DATABASE_URL and Atlas Network Access.',
  );
}

export function getImagesCollection(): Collection<ImageDocument> {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db.collection<ImageDocument>('images');
}

export function toObjectId(id: string): ObjectId {
  return new ObjectId(id);
}

export function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id);
}

export type StoredImage = WithId<ImageDocument>;

export async function disconnectDatabase(): Promise<void> {
  if (globalForMongo.mongoClient) {
    await globalForMongo.mongoClient.close();
    globalForMongo.mongoClient = undefined;
  }
  if (globalForMongo.memoryServer) {
    await globalForMongo.memoryServer.stop();
    globalForMongo.memoryServer = undefined;
  }
  logger.info('Database disconnected');
}
