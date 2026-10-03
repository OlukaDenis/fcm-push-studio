import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS with support for development, preview, and production origins
  const corsOriginEnv = process.env.CORS_ORIGIN || process.env.CORS_ORIGINS;
  const allowedOrigins = corsOriginEnv
    ? corsOriginEnv === '*'
      ? true
      : corsOriginEnv.split(',').map((o) => o.trim())
    : (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        // or any localhost / 127.0.0.1 port
        if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      };

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Global prefix for all API routes
  app.setGlobalPrefix('api');

  // Request validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Global exception filter with Firebase error code handling
  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`🚀 FCM Push API server running on: http://localhost:${port}/api`);
}

bootstrap();
