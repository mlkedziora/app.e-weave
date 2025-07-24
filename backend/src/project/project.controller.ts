// backend/src/project/project.controller.ts
import { Controller, Get, Post, Patch, Delete, Param, Body, NotFoundException, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProjectService } from './project.service.js';
import { CreateProjectDto } from './dto/create-project.js';
import { Multer } from 'multer';
import express from 'express';
type Request = express.Request;

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() body: any,  // Use 'any' to avoid early DTO validation
    @Req() req: Request,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const parsedDto = {
      name: body.name,
      startDate: body.startDate,
      deadline: body.deadline,
      initialNotes: body.initialNotes,
      teamMemberIds: body.teamMemberIds ? JSON.parse(body.teamMemberIds) : undefined,
      materialIds: body.materialIds ? JSON.parse(body.materialIds) : undefined,
      initialTasks: body.initialTasks ? JSON.parse(body.initialTasks) : undefined,
    } as CreateProjectDto;  // Cast to your DTO type

    // Optional: Add manual validation here if needed (e.g., check arrays)

    const userId = req.user?.id;
    return this.projectService.create(parsedDto, userId, image);
  }

  @Get()
  async findAll() {
    return this.projectService.findAllWithSummary();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const project = await this.projectService.findOneWithDetails(id);
    if (!project) throw new NotFoundException('Project not found');
    const transformed = {
      ...project,
      materials: project.assignedMaterials.map((am) => ({
        ...am.material,
        category: am.material.category?.name || 'Uncategorized',  // Flatten category to string
      })),
      assignees: project.assignees.map((a) => a.teamMember),  // Flatten to list of team members
    };
    delete (transformed as any).assignedMaterials;
    // Remove this line: delete (transformed as any).assignees;  // Do not delete the flattened assignees
    return transformed;
  }

  @Post(':id/notes')
  async createNote(@Req() req: Request, @Param('id') id: string, @Body() body: { content: string }) {
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

  // Add team members (assignees) to an existing project
  @Post(':id/assignees')
  async addAssignees(
    @Param('id') id: string,
    @Body() body: { teamMemberIds: string[] },
  ) {
    return this.projectService.addAssignees(id, body.teamMemberIds);
  }

  // Add materials to an existing project
  @Post(':id/materials')
  async addMaterials(
    @Param('id') id: string,
    @Body() body: { materialIds: string[] },
  ) {
    return this.projectService.addMaterials(id, body.materialIds);
  }
}