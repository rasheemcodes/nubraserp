import {
  Controller,
  Get,
  Post,
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Post('error')
  getError() {
    throw new BadRequestException('test error');
  }
}