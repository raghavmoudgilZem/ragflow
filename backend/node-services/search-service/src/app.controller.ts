import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  // 1. Initialize the NestJS Logger utility
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    // 2. This will log to your console every time someone hits the endpoint
    this.logger.log('Incoming request received at GET /');
    return this.appService.getHello();
  }
}
