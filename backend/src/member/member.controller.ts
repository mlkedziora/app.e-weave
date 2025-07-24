// backend/src/member/member.controller.ts
import { Controller, Get, Post, Body, Param, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MemberService } from './member.service.js';
import { CreateTeamMemberDto } from './dto/create-team-member.dto.js';
import { Roles } from '../auth/roles.decorator.js';
import { Multer } from 'multer';
import express from 'express';
type Request = express.Request;

@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Roles('admin')
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() dto: CreateTeamMemberDto,
    @Req() req: Request,
    @UploadedFile() image?: Express.Multer.File, // Optional last
  ) {
    const userId = req.user?.id;
    return this.memberService.create(dto, userId, image);
  }

  @Get()
  findAll() {
    return this.memberService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.memberService.findOne(id);
  }

  @Post('webhooks/clerk')
  async handleClerkWebhook(@Body() payload: any) {
    return this.memberService.handleClerkWebhook(payload);
  }
}