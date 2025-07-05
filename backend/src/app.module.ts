import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { TeamModule } from './team/team.module.js';
import { MaterialModule } from './material/material.module.js';
import { ProjectModule } from './project/project.module.js';
import { MemberModule } from './member/member.module.js';

import { RolesGuard } from './auth/roles.guard.js'; // 🔐 Import your custom guard
import { PrismaService } from './prisma/prisma.service.js';

@Module({
  imports: [TeamModule, MaterialModule, ProjectModule, MemberModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // 🔐 Register it globally
    },
    PrismaService,
  ],
})
export class AppModule {}
