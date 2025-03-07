import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Req, HttpException, HttpStatus } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationsService } from './applications.service';
import { Application } from './entities/application.entity';
import { ApplicationLogService } from './applications-log.service';
import { ApplicationLog } from './entities/application-log.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from 'src/auth/roles.decorator';

@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationsController {
  constructor(
    private appService: ApplicationsService,
    private logService: ApplicationLogService,
  ) {}

  @Get('hunter')
  @Role('HUNTER')
  async findAllForHunters(): Promise<Application[]> {
    try {
      return await this.appService.findAllForHunters();
    } catch (error) {
      throw new HttpException('Error fetching applications for hunters', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('dev/:id')
  @Role('HUNTER_DEV')
  async findAllForDevelopers(@Param('id', ParseIntPipe) id: number): Promise<Application[]> {
    try {
      const user = await this.appService.findByUser(id);
      return user;
      
    } catch (error) {
      throw new HttpException('Error fetching applications for developers', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/logs')
  @Role('HUNTER_ADMIN')
  async getLogs(@Param('id', ParseIntPipe) id: number): Promise<ApplicationLog[]> {
    try {
      return await this.logService.getLogsByApplication(id);
    } catch (error) {
      throw new HttpException('Error fetching application logs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @Role('HUNTER_ADMIN')
  async findAll(): Promise<Application[]> {
    try {
      return await this.appService.findAll();
    } catch (error) {
      throw new HttpException('Error fetching all applications', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @Role('HUNTER')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Application> {
    try {
      return await this.appService.findOne(id);
    } catch (error) {
      throw new HttpException('Error fetching application', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @Role('HUNTER_ADMIN')
  async create(@Body() createApplicationDto: CreateApplicationDto, @Req() req): Promise<Application> {
    try {
      console.log(req.user);
      return await this.appService.create(createApplicationDto, req.user);
    } catch (error) {
      throw new HttpException('Error creating application', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  @Role('HUNTER_ADMIN')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateApplicationDto: CreateApplicationDto, @Req() req): Promise<Application> {
    try {
      return await this.appService.update(id, updateApplicationDto, req.user);
    } catch (error) {
      throw new HttpException('Error updating application', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}