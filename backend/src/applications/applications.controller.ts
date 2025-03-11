import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Req, HttpException, HttpStatus, Query } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationsService } from './applications.service';
import { Application } from './entities/application.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from 'src/auth/roles.decorator';
import { RoleEnum } from 'src/auth/roles.enum';

@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationsController {
  constructor(
    private appService: ApplicationsService,
  ) {}

  @Get()
  async getApplications(
    @Query('page') page: string, 
    @Req() req: any,
  ): Promise<Application[]> {
    const { role, userId } = req.user;
  
    // Gestion des accès en fonction du rôle et de la page demandée
    if (page === 'hunter' && ![RoleEnum.HUNTER, RoleEnum.HUNTER_DEV, RoleEnum.HUNTER_ADMIN].includes(role)) {
      throw new HttpException('Accès refusé.', HttpStatus.FORBIDDEN);
    }
    if (page === 'dev' && ![RoleEnum.HUNTER_DEV, RoleEnum.HUNTER_ADMIN].includes(role)) {
      throw new HttpException('Accès refusé.', HttpStatus.FORBIDDEN);
    }
    if (page === 'admin' && role !== RoleEnum.HUNTER_ADMIN) {
      throw new HttpException('Accès refusé.', HttpStatus.FORBIDDEN);
    }
  
    return await this.appService.getApplicationsByRoleAndPage(page, role, userId);
  }
  
  @Get(':id')
  @Role('HUNTER')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Application> {
    try {
      return await this.appService.findOne(id);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @Role('HUNTER_ADMIN')
  async create(@Body() createApplicationDto: CreateApplicationDto, @Req() req): Promise<Application> {
    try {
      return await this.appService.create(createApplicationDto);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
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