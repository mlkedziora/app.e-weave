// backend/src/project/project.controller.ts
import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ProjectService } from './project.service.js';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async findAll() {
    return this.projectService.findAllWithSummary();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const project = await this.projectService.findOneWithDetails(id);
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }
}
