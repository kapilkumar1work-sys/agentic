import express from 'express';
import { config } from './config';
import { securityMiddleware } from './middleware/security';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import imageRoutes from './routes/imageRoutes';
import { connectDatabase, disconnectDatabase } from './utils/mongodb';
import { s3Service } from './services/s3Service';
import { logger } from './utils/logger';
import { closeQueues } from './queues/imageValidationQueue';

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(...securityMiddleware);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(`${config.apiPrefix}/images`, imageRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function bootstrap(): Promise<void> {
  await connectDatabase();
  await s3Service.ensureBucketsExist();

  const server = app.listen(config.port, () => {
    logger.info(`API server running on port ${config.port}`);
    logger.info(`Environment: ${config.env}`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully`);
    server.close(async () => {
      await closeQueues();
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});

export default app;
