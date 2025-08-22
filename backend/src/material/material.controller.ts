// backend/src/material/material.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MaterialService } from './material.service.js';
import { CreateMaterialDto } from './dto/create-material.dto.js';
import { CreateMaterialHistoryDto } from './dto/create-material-history.dto.js';
import { Multer } from 'multer';
import { Prisma } from '@prisma/client'; // For Prisma types
import express from 'express';
type Request = express.Request;

@Controller('materials')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {
    console.log('[MaterialController] MaterialService injected:', this.materialService ? 'yes' : 'no'); // Log to check injection
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() dto: CreateMaterialDto,
    @Req() req: Request,
    @UploadedFile() image?: Express.Multer.File, // Optional last in signature
  ) {
    const userId = req.user?.id;
    return this.materialService.create(dto, userId, image);
  }

  @Get()
  findAll(@Req() req: Request) {
    const userId = req.user?.id;
    return this.materialService.findAllWithCategoryAndNotes(userId);
  }

  // Moved up: Specific route before dynamic :id
  @Get('categories') // New endpoint
  getCategories(@Req() req: Request) {
    const userId = req.user?.id;
    console.log('[MaterialController] Fetching categories for userId:', userId); // Updated log
    const categories = this.materialService.getCategories(userId);
    console.log('[MaterialController] Returning categories:', categories); // Log return value
    return categories;
  }

  @Post('categories')
  createCategory(@Body() body: { name: string }, @Req() req: Request) {
    const userId = req.user?.id;
    if (!userId) throw new Error('Unauthorized');
    return this.materialService.createCategory(body.name, userId);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string, @Req() req: Request) {
    const userId = req.user?.id;
    if (!userId) throw new Error('Unauthorized');
    return this.materialService.deleteCategory(id, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materialService.findOneWithDetails(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Prisma.MaterialUpdateInput) { // Fixed Prisma type
    return this.materialService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.materialService.delete(id);
  }

  @Post(':id/history')
  createHistoryEntry(
    @Param('id') materialId: string,
    @Body() dto: CreateMaterialHistoryDto,
    @Req() req: Request
  ) {
    const userId = req.user?.id;
    if (!userId) throw new Error('Unauthorized');
    return this.materialService.createHistoryEntry(materialId, userId, dto);
  }

  @Get(':id/notes')
  async getNotes(@Param('id') id: string) {
    return this.materialService.getNotes(id);
  }

  @Post(':id/notes')
  async addNote(@Param('id') id: string, @Body() body: { content: string }, @Req() req: Request) {
    console.log(`[addNote Controller] Request: materialId=${id}, body=${JSON.stringify(body)}, user=${JSON.stringify(req.user)}`);
    const userId = req.user?.id;
    if (!userId) {
      console.warn('[addNote Controller] Missing userId from req.user');
      throw new Error('Unauthorized'); // Temporary log
    }
    return this.materialService.addNote(id, body.content, userId);
  }

  @Patch('notes/:noteId')
  async editNote(@Param('noteId') noteId: string, @Body() body: { content: string }, @Req() req: Request) {
    const userId = req.user?.id;
    if (!userId) throw new Error('Unauthorized');
    return this.materialService.editNote(noteId, body.content, userId);
  }

  @Delete('notes/:noteId')
  async deleteNote(@Param('noteId') noteId: string, @Req() req: Request) {
    const userId = req.user?.id;
    if (!userId) throw new Error('Unauthorized');
    return this.materialService.deleteNote(noteId, userId);
  }
}