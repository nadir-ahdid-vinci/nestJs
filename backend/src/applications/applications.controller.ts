import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  UseFilters,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { CreateCriticalityDto } from './dto/create-criticality.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { Request } from 'express';
import { Application } from './entities/application.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { UsersService } from '../users/users.service';
import { ApplicationLogoInterceptor } from '../common/interceptors/application-logo.interceptor';
import { UpdateCriticalityDto } from './dto/update-criticality.dto';
import { CriticalityLogService } from './services/criticality-log.service';

/**
 * Interface pour typer la requête avec les informations de l'utilisateur
 */
interface RequestWithUser extends Request {
  user: {
    userId: number;
    role: UserRole;
  };
}

/**
 * Contrôleur gérant toutes les opérations liées aux applications et aux criticités
 *
 * Ce contrôleur fournit les endpoints pour :
 * - La gestion des applications (CRUD)
 * - La gestion des niveaux de criticité
 * - La gestion des logs
 * - La gestion des photos
 */
@ApiTags('Applications')
@ApiBearerAuth()
@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseFilters(HttpExceptionFilter)
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly usersService: UsersService,
    private readonly criticalityLogService: CriticalityLogService,
  ) {}

  /**
   * ============================================
   * Gestion des applications
   * ============================================
   */

  /**
   * Récupère la liste des applications avec pagination
   * L'accès est filtré en fonction du type de vue (hunter/dev/admin)
   */
  @ApiOperation({ summary: 'Liste des applications' })
  @ApiQuery({ name: 'page', enum: ['hunter', 'dev', 'admin'], description: 'Type de vue' })
  @ApiResponse({ status: 200, description: 'Liste des applications récupérée avec succès' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 500, description: 'Erreur interne du serveur' })
  @Get()
  @Role(UserRole.HUNTER)
  async findAll(
    @Query('page') page: string,
    @Req() req: RequestWithUser,
  ): Promise<{
    items: Application[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { userId, role } = req.user;
    if (page === 'hunter' && ![UserRole.HUNTER, UserRole.DEV, UserRole.ADMIN].includes(role)) {
      throw new HttpException('Accès non autorisé', HttpStatus.FORBIDDEN);
    }
    if (page === 'dev' && ![UserRole.DEV, UserRole.ADMIN].includes(role)) {
      throw new HttpException('Accès refusé.', HttpStatus.FORBIDDEN);
    }
    if (page === 'admin' && role !== UserRole.ADMIN) {
      throw new HttpException('Accès refusé.', HttpStatus.FORBIDDEN);
    }
    return await this.applicationsService.findAll(page, userId);
  }

  /**
   * Récupère les détails d'une application spécifique
   */
  @ApiOperation({ summary: "Détails d'une application" })
  @ApiParam({ name: 'id', description: "ID de l'application" })
  @ApiResponse({ status: 200, description: 'Application trouvée avec succès' })
  @ApiResponse({ status: 404, description: 'Application non trouvée' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 500, description: 'Erreur interne du serveur' })
  @Get(':id')
  @Role(UserRole.HUNTER)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.applicationsService.findOne(id);
  }

  /**
   * Crée une nouvelle application avec logo
   */
  @Post()
  @Role(UserRole.ADMIN)
  @UseInterceptors(ApplicationLogoInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateApplicationDto })
  @ApiResponse({ status: 201, description: 'Application créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides ou logo invalide' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 409, description: 'Une application avec ce nom existe déjà' })
  @ApiResponse({ status: 404, description: 'Criticité ou utilisateur non trouvé' })
  @ApiResponse({ status: 500, description: 'Erreur interne du serveur' })
  async create(
    @Req() req: RequestWithUser,
    @Body() createApplicationDto: CreateApplicationDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.applicationsService.create(createApplicationDto, req.user.userId, file);
  }

  /**
   * Met à jour une application existante
   */
  @ApiOperation({ summary: "Mise à jour d'une application" })
  @ApiParam({ name: 'id', description: "ID de l'application" })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateApplicationDto })
  @ApiResponse({ status: 200, description: 'Application mise à jour avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Application non trouvée' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 409, description: 'Une application avec ce nom existe déjà' })
  @ApiResponse({ status: 500, description: 'Erreur interne du serveur' })
  @Patch(':id')
  @Role(UserRole.ADMIN)
  @UseInterceptors(ApplicationLogoInterceptor)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateApplicationDto: UpdateApplicationDto,
    @Req() req: RequestWithUser,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      updateApplicationDto.logo = file;
    }
    return this.applicationsService.update(id, updateApplicationDto, req.user.userId);
  }

  /**
   * ============================================
   * Gestion des criticités
   * ============================================
   */

  /**
   * Récupère la liste des niveaux de criticité
   */
  @ApiOperation({ summary: 'Liste des niveaux de criticité' })
  @ApiResponse({ status: 200, description: 'Liste des criticités récupérée avec succès' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 404, description: 'Aucune criticité trouvée' })
  @ApiResponse({ status: 500, description: 'Erreur interne du serveur' })
  @Get('criticality')
  @Role(UserRole.ADMIN)
  async findAllCriticality() {
    return await this.applicationsService.findAllCriticality();
  }

  /**
   * Récupère les détails d'un niveau de criticité
   */
  @ApiOperation({ summary: "Détails d'un niveau de criticité" })
  @ApiParam({ name: 'id', description: 'ID de la criticité' })
  @ApiResponse({ status: 200, description: 'Criticité trouvée avec succès' })
  @ApiResponse({ status: 404, description: 'Criticité non trouvée' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 500, description: 'Erreur interne du serveur' })
  @Get('criticality/:id')
  @Role(UserRole.ADMIN)
  async findOneCriticality(@Param('id', ParseIntPipe) id: number) {
    return await this.applicationsService.findOneCriticality(id);
  }

  /**
   * Crée un nouveau niveau de criticité
   */
  @ApiOperation({ summary: "Création d'un niveau de criticité" })
  @ApiBody({ type: CreateCriticalityDto })
  @ApiResponse({ status: 201, description: 'Criticité créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données de criticité invalides' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 409, description: 'Une criticité avec ce nom existe déjà' })
  @ApiResponse({ status: 500, description: 'Erreur interne du serveur' })
  @Post('criticality')
  @Role(UserRole.ADMIN)
  async createCriticality(
    @Body() createCriticalityDto: CreateCriticalityDto,
    @Req() req: RequestWithUser,
  ) {
    const userDto = await this.usersService.findOne(req.user.userId);
    return this.applicationsService.createCriticality(createCriticalityDto, userDto);
  }

  /**
   * Met à jour un niveau de criticité existant
   */
  @ApiOperation({ summary: "Mise à jour d'un niveau de criticité" })
  @ApiParam({ name: 'id', description: 'ID de la criticité' })
  @ApiBody({ type: UpdateCriticalityDto })
  @ApiResponse({ status: 200, description: 'Criticité mise à jour avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Criticité non trouvée' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 409, description: 'Une criticité avec ce nom existe déjà' })
  @ApiResponse({ status: 500, description: 'Erreur interne du serveur' })
  @Patch('criticality/:id')
  @Role(UserRole.ADMIN)
  async updateCriticality(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCriticalityDto: UpdateCriticalityDto,
    @Req() req: RequestWithUser,
  ) {
    const userDto = await this.usersService.findOne(req.user.userId);
    return this.applicationsService.updateCriticality(id, updateCriticalityDto, userDto);
  }

  /**
   * ============================================
   * Gestion des logs
   * ============================================
   */

  /**
   * Récupère la liste des logs d'applications
   */
  @ApiOperation({ summary: "Liste des logs d'applications" })
  @ApiResponse({ status: 200, description: 'Logs récupérés avec succès' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 500, description: 'Erreur interne du serveur' })
  @Get('logs')
  @Role(UserRole.ADMIN)
  async getLogs() {
    return await this.applicationsService.getLogs();
  }

  /**
   * Récupère les logs d'une application spécifique
   */
  @ApiOperation({ summary: "Logs d'une application spécifique" })
  @ApiParam({ name: 'id', description: "ID de l'application" })
  @ApiResponse({ status: 200, description: "Logs de l'application récupérés avec succès" })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 404, description: 'Application non trouvée' })
  @ApiResponse({ status: 500, description: 'Erreur interne du serveur' })
  @Get(':id/logs')
  @Role(UserRole.ADMIN)
  async getApplicationLogs(@Param('id', ParseIntPipe) id: number) {
    return await this.applicationsService.getApplicationLogs(id);
  }

  /**
   * Récupère la liste des logs de criticités
   */
  @ApiOperation({ summary: 'Liste des logs de criticités' })
  @ApiResponse({ status: 200, description: 'Logs récupérés avec succès' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 500, description: 'Erreur interne du serveur' })
  @Get('criticality/logs')
  @Role(UserRole.ADMIN)
  async getCriticalityLogs(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    return await this.criticalityLogService.findAll(page, limit);
  }

  /**
   * Récupère les logs d'une criticité spécifique
   */
  @ApiOperation({ summary: "Logs d'une criticité spécifique" })
  @ApiParam({ name: 'id', description: 'ID de la criticité' })
  @ApiResponse({ status: 200, description: 'Logs de la criticité récupérés avec succès' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 404, description: 'Criticité non trouvée' })
  @ApiResponse({ status: 500, description: 'Erreur interne du serveur' })
  @Get('criticality/:id/logs')
  @Role(UserRole.ADMIN)
  async getCriticalityLogById(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    return await this.criticalityLogService.findByCriticality(id, page, limit);
  }
}
