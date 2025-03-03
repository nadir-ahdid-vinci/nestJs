// applications/applications.controller.ts (Contrôleur Applications)
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationsService } from './applications.service';
import { Application } from './entities/application.entity';

@Controller('applications')
export class ApplicationsController {
  constructor(private appService: ApplicationsService) {}

  @Get()
  async findAll(): Promise<Application[]> {
    return await this.appService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Application> {
    return this.appService.findOne(id);
  }

  @Post()
  create(@Body() createApplicationDto: CreateApplicationDto): Promise<Application> {
    return this.appService.create(createApplicationDto);
  }
}