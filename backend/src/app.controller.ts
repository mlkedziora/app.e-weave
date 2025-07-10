// backend/src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
    console.log('🧪 AppService injected in AppController:', appService);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
