// backend/src/material/material.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MaterialController } from './material.controller.js';
import { MaterialService } from './material.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { clerkMiddleware } from '../auth/clerk.middleware.js'; // Import your middleware
import { MulterModule } from '@nestjs/platform-express'; // New
import { diskStorage } from 'multer'; // New

@Module({
  imports: [
    PrismaModule, // 👈 this gives access to PrismaService
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, Date.now() + '-' + file.originalname);
        },
      }),
    }), // New: Multer config for file uploads
  ],
  controllers: [MaterialController],
  providers: [MaterialService],
})
export class MaterialModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(clerkMiddleware).forRoutes('materials');
  }
}