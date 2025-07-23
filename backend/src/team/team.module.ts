import { Module } from '@nestjs/common';
import { TeamService } from './team.service.js';
import { TeamController } from './team.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js'; // Add this

@Module({
  imports: [PrismaModule], // Add this
  providers: [TeamService],
  controllers: [TeamController]
})
export class TeamModule {}