import { Module } from '@nestjs/common'
import { MemberService } from './member.service.js'
import { MemberController } from './member.controller.js'
import { PrismaModule } from '../prisma/prisma.module.js'

@Module({
  imports: [PrismaModule],
  controllers: [MemberController],
  providers: [MemberService],
})
export class MemberModule {}
