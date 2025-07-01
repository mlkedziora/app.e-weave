import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TeamModule } from './team/team.module';
import { MaterialModule } from './material/material.module';
import { ProjectModule } from './project/project.module';
import { MemberModule } from './member/member.module';

import { RolesGuard } from './auth/roles.guard'; // 🔐 Import your custom guard

@Module({
  imports: [TeamModule, MaterialModule, ProjectModule, MemberModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // 🔐 Register it globally
    },
  ],
})
export class AppModule {}
