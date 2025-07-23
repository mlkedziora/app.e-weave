import 'reflect-metadata'; // 👈 This must be first

import { NestFactory } from '@nestjs/core';
console.log('✅ Step 1: Imported NestFactory');

import { AppModule } from './app.module.js';
console.log('✅ Step 2: Imported AppModule');

import { ValidationPipe, HttpServer } from '@nestjs/common'; // Updated: Added HttpServer for shutdown hooks
console.log('✅ Step 3: Imported ValidationPipe');

import dotenv from 'dotenv';
dotenv.config();
console.log('✅ Step 4: Loaded .env');

// ✅ Add import for middleware
import { clerkMiddleware } from './auth/clerk.middleware.js';

async function bootstrap() {
  console.log('🚀 Step 5: Entering bootstrap');
  const app = await NestFactory.create(AppModule);

  // Masked env logging (dev-only)
  if (process.env.NODE_ENV === 'development') {
    const safeEnv = { ...process.env };
    delete safeEnv.CLERK_SECRET_KEY; // Mask Clerk secret
    delete safeEnv.DATABASE_URL; // Mask DB URL (contains password)
    // Add more deletions if you have other secrets, e.g., delete safeEnv.OTHER_SECRET;
    console.log('Safe process.env (masked):', safeEnv);
  }

  console.log('✅ Step 6: Created Nest app');

  app.enableCors({
    origin: true, // For dev; tighten in prod, e.g., origin: 'http://localhost:5173'
    methods: 'GET,POST,PATCH,DELETE',
    allowedHeaders: 'Authorization, Content-Type',
  });
  console.log('✅ Step 7: Enabled CORS');

  // ✅ Apply middleware globally (ensures all routes are authenticated unless public)
  app.use(clerkMiddleware);
  console.log('✅ Step 7.5: Applied Clerk middleware globally');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  console.log('✅ Step 8: Applied global validation');

  // Add graceful shutdown hooks
  app.enableShutdownHooks(app.get(HttpServer)); // For clean app close on signals

  await app.listen(3000);
  console.log('🚀 Step 9: Backend is running on http://localhost:3000');
}

bootstrap().catch((error) => {
  console.error('❌ Step X: Error during bootstrap execution:', error);
  process.exit(1);
});