import { Module } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core'; // ← include Reflector

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { TeamModule } from './team/team.module.js';
import { MaterialModule } from './material/material.module.js';
import { ProjectModule } from './project/project.module.js';
import { MemberModule } from './member/member.module.js';

import { RolesGuard } from './auth/roles.guard.js';
import { PrismaService } from './prisma/prisma.service.js';

@Module({
  imports: [TeamModule, MaterialModule, ProjectModule, MemberModule],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    Reflector, // ✅ Explicitly include Reflector
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
