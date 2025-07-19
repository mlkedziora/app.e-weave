// backend/src/project/project.controller.ts
import { Controller, Get, Post, Patch, Delete, Param, Body, NotFoundException, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // New
import { ProjectService } from './project.service.js';
import { CreateProjectDto } from './dto/create-project.js';
import express from 'express';
type Request = express.Request;

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image')) // New
  async create(
    @Body() dto: CreateProjectDto,
    @UploadedFile() image: Express.Multer.File, // New
    @Req() req: Request
  ) {
    const userId = req.user?.id;
    return this.projectService.create(dto, userId, image);
  }

  @Get()
  async findAll() {
    return this.projectService.findAllWithSummary();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const project = await this.projectService.findOneWithDetails(id);
    if (!project) throw new NotFoundException('Project not found');
    // Transform assignedMaterials to materials array for frontend
    const transformed = {
      ...project,
      materials: project.assignedMaterials.map((am) => am.material),
    };
    delete transformed.assignedMaterials;
    return transformed;
  }

  @Post(':id/notes')
  async createNote(@Req() req, @Param('id') id: string, @Body() body: { content: string }) {
    const user = req.user;
    return this.projectService.addNote(id, user.id, body.content);
  }

  @Patch('notes/:noteId')
  async updateNote(@Param('noteId') noteId: string, @Body() body: { content: string }) {
    // TODO: Add authorization check if needed (e.g., owns the note)
    return this.projectService.updateNote(noteId, body.content);
  }

  @Delete('notes/:noteId')
  async deleteNote(@Param('noteId') noteId: string) {
    // TODO: Add authorization check if needed
    return this.projectService.deleteNote(noteId);
  }
}