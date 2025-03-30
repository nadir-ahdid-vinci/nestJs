/**
 * Contrôleur gérant les récompenses de l'application
 * Fournit les endpoints pour la gestion complète des récompenses (CRUD)
 * Implémente la sécurité via JWT et le contrôle des rôles
 * Gère l'upload des photos via un intercepteur dédié
 * @class RewardsController
 */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  Req,
  Delete,
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import { Role } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/enums/user-role.enum';
import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { RewardDto } from './dto/reward.dto';
import { RewardLogDto } from './dto/reward-log.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

/**
 * Interface étendant Request pour inclure les informations utilisateur
 * Utilisée pour la gestion des requêtes authentifiées
 * @interface RequestWithUser
 * @extends Request
 */
interface RequestWithUser extends Request {
  user: {
    userId: number;
    role: UserRole;
  };
}

@ApiTags('Rewards')
@ApiBearerAuth()
@Controller('rewards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  /**
   * Récupère la liste paginée des récompenses
   * Endpoint: GET /rewards
   * Accessible aux chasseurs de bugs
   * @param {number} page - Numéro de la page (optionnel, défaut: 1)
   * @returns {Promise<{ items: RewardDto[]; total: number; pages: number }>} Liste paginée des récompenses
   */
  @Get()
  @Role(UserRole.HUNTER)
  @ApiOperation({ summary: 'Récupérer les récompenses (paginées)' })
  @ApiResponse({
    status: 200,
    description: 'Liste paginée des récompenses récupérée avec succès',
    type: Object,
  })
  async findAll(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number): Promise<{
    items: RewardDto[];
    total: number;
    pages: number;
  }> {
    return await this.rewardsService.findAll(page);
  }

  /**
   * Récupère une récompense spécifique par son ID
   * Endpoint: GET /rewards/:id
   * Accessible aux chasseurs de bugs
   * @param {number} id - L'identifiant de la récompense
   * @returns {Promise<RewardDto>} La récompense demandée
   * @throws {RewardNotFoundByIdException} Si la récompense n'existe pas
   */
  @Get(':id')
  @Role(UserRole.HUNTER)
  @ApiOperation({ summary: 'Récupérer une récompense par son ID' })
  @ApiResponse({
    status: 200,
    description: 'Récompense trouvée avec succès',
    type: RewardDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Récompense non trouvée',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<RewardDto> {
    return await this.rewardsService.findOne(id);
  }

  /**
   * Crée une nouvelle récompense
   * Endpoint: POST /rewards
   * Accessible uniquement aux administrateurs
   * Gère l'upload de la photo via multer
   * @param {RequestWithUser} req - La requête avec les informations utilisateur
   * @param {CreateRewardDto} createRewardDto - Les données de la récompense
   * @param {Express.Multer.File} photo - La photo de la récompense
   * @returns {Promise<RewardDto>} La récompense créée
   * @throws {InvalidRewardPhotoException} Si la photo est invalide
   * @throws {RewardAlreadyExistsException} Si le nom existe déjà
   * @throws {TooManyUploadsException} Si trop de tentatives d'upload
   */
  @Post()
  @Role(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('photo'))
  @ApiOperation({ summary: 'Créer une nouvelle récompense' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Données de la récompense avec photo',
    type: CreateRewardDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Récompense créée avec succès',
    type: RewardDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides ou photo manquante',
  })
  @ApiResponse({
    status: 409,
    description: 'Une récompense avec ce nom existe déjà',
  })
  async create(
    @Req() req: RequestWithUser,
    @Body() createRewardDto: CreateRewardDto,
    @UploadedFile() photo: Express.Multer.File,
  ): Promise<RewardDto> {
    return await this.rewardsService.create(createRewardDto, req.user.userId, photo);
  }

  /**
   * Met à jour une récompense existante
   * Endpoint: PATCH /rewards/:id
   * Accessible uniquement aux administrateurs
   * Permet de modifier les informations et/ou la photo
   * @param {number} id - L'identifiant de la récompense
   * @param {UpdateRewardDto} updateRewardDto - Les données à mettre à jour
   * @param {RequestWithUser} req - La requête avec les informations utilisateur
   * @param {Express.Multer.File} photo - La nouvelle photo (optionnelle)
   * @returns {Promise<RewardDto>} La récompense mise à jour
   * @throws {RewardNotFoundByIdException} Si la récompense n'existe pas
   * @throws {RewardAlreadyExistsException} Si le nouveau nom existe déjà
   * @throws {TooManyUploadsException} Si trop de tentatives d'upload
   */
  @Patch(':id')
  @Role(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('photo'))
  @ApiOperation({ summary: 'Mettre à jour une récompense' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Données de mise à jour de la récompense',
    type: UpdateRewardDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Récompense mise à jour avec succès',
    type: RewardDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Récompense non trouvée',
  })
  @ApiResponse({
    status: 409,
    description: 'Une récompense avec ce nom existe déjà',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRewardDto: UpdateRewardDto,
    @Req() req: RequestWithUser,
    @UploadedFile() photo?: Express.Multer.File,
  ): Promise<RewardDto> {
    return this.rewardsService.update(id, updateRewardDto, req.user.userId, photo);
  }

  /**
   * Supprime une récompense
   * Endpoint: DELETE /rewards/:id
   * Accessible uniquement aux administrateurs
   * Supprime également la photo associée
   * @param {number} id - L'identifiant de la récompense
   * @param {RequestWithUser} req - La requête avec les informations utilisateur
   * @returns {Promise<void>}
   * @throws {RewardNotFoundByIdException} Si la récompense n'existe pas
   */
  @Delete(':id')
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Supprimer une récompense' })
  @ApiResponse({
    status: 200,
    description: 'Récompense supprimée avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Récompense non trouvée',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser): Promise<void> {
    return this.rewardsService.remove(id, req.user.userId);
  }

  /**
   * Récupère tous les logs liés aux récompenses
   * Endpoint: GET /rewards/logs
   * Accessible uniquement aux administrateurs
   * @returns {Promise<RewardLogDto[]>} Liste des logs des récompenses
   */
  @Get('logs')
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Récupérer tous les logs des récompenses' })
  @ApiResponse({
    status: 200,
    description: 'Logs des récompenses récupérés avec succès',
    type: [RewardLogDto],
  })
  async getRewardLogs(): Promise<RewardLogDto[]> {
    return await this.rewardsService.getRewardLogs();
  }
}
