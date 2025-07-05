import { Controller, Get } from '@nestjs/common'
import { MemberService } from './member.service.js'

@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get()
  findAll() {
    return this.memberService.findAll()
  }
}
