import { Module } from '@nestjs/common';
import { MaterialController } from './material.controller.js';
import { MaterialService } from './material.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
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
export class MaterialModule {}