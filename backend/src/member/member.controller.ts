// backend/src/member/member.controller.ts
import { Controller, Get, Param } from '@nestjs/common'
import { MemberService } from './member.service.js'

@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get()
  findAll() {
    return this.memberService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.memberService.findOne(id)
  }
}