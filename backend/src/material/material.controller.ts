// backend/src/material/material.controller.ts
import { Controller, Post, Body, Get, Param, Patch, Delete } from '@nestjs/common'
import { MaterialService } from './material.service.js'
import { Prisma } from '@prisma/client'
import { CurrentUser, AuthenticatedUser } from '../auth/current-user.decorator.js'

@Controller('materials')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Post()
  create(@Body() data: Prisma.MaterialCreateInput) {
    return this.materialService.create(data)
  }
  
  @Get()
  findAll() {
    return this.materialService.findAllUnsafe(); // temporary, no team filter
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materialService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Prisma.MaterialUpdateInput) {
    return this.materialService.update(id, data)
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.materialService.delete(id)
  }
}
