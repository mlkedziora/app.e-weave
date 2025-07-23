// backend/src/team/team.controller.ts
import { Controller, Post, Body, Req } from '@nestjs/common';
import { TeamService } from './team.service.js';
import { CreateTeamDto } from './dto/create-team.dto.js'; // You'll create this file next
import { Roles } from '../auth/roles.decorator.js';
import express from 'express';
type Request = express.Request;

@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Roles('admin') // Restrict to admins if desired
  @Post()
  async create(@Body() dto: CreateTeamDto, @Req() req: Request) {
    const userId = req.user?.id;
    return this.teamService.create(dto, userId);
  }
}