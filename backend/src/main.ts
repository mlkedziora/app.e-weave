import { NestFactory } from '@nestjs/core';
console.log('✅ Step 1: Imported NestFactory');

import { AppModule } from './app.module.js';
console.log('✅ Step 2: Imported AppModule');

import { ValidationPipe } from '@nestjs/common';
console.log('✅ Step 3: Imported ValidationPipe');

import dotenv from 'dotenv';
dotenv.config();
console.log('✅ Step 4: Loaded .env');

async function bootstrap() {
  console.log('🚀 Step 5: Entering bootstrap');
  try {
    const app = await NestFactory.create(AppModule);
    console.log('✅ Step 6: Created Nest app');

    app.enableCors();
    console.log('✅ Step 7: Enabled CORS');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
      }),
    );
    console.log('✅ Step 8: Applied global validation');

    await app.listen(3000);
    console.log('🚀 Step 9: Backend is running on http://localhost:3000');
  } catch (error) {
    console.error('❌ Step X: Error during bootstrap:', error);
    process.exit(1);
  }
}

bootstrap();
