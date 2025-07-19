import { Module } from '@nestjs/common'
import { MemberService } from './member.service.js'
import { MemberController } from './member.controller.js'
import { PrismaModule } from '../prisma/prisma.module.js'
import { MulterModule } from '@nestjs/platform-express'; // New
import { diskStorage } from 'multer'; // New

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, Date.now() + '-' + file.originalname);
        },
      }),
    }), // New
  ],
  controllers: [MemberController],
  providers: [MemberService],
})
export class MemberModule {}