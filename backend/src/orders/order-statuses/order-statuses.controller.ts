/**
 * Contrôleur pour les statuts de commande
 * Gère les opérations CRUD et la gestion des logs
 * @class OrderStatusesController
 */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrderStatusesService } from './order-statuses.service';
import { CreateOrderStatusDto } from './dto/create-order-status.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UserRole } from '../../users/enums/user-role.enum';
import {
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { Role } from '../../auth/roles.decorator';
import { OrderStatusDto } from './dto/order-status.dto';
import { OrderStatusLogDto } from './dto/order-status-log.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';

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

@ApiTags('Order Statuses')
@ApiBearerAuth()
@Controller('order-statuses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderStatusesController {
  constructor(private readonly orderStatusesService: OrderStatusesService) {}

  /**
   * Crée un nouveau statut de commande
   * @param createOrderStatusDto - Données du statut de commande à créer
   * @returns Le statut de commande créé
   * @throws {InvalidOrderStatusDtoException} Si les données sont invalides
   * @throws {OrderStatusAlreadyExistsException} Si le statut de commande existe déjà
   */
  @Post()
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Créer un nouveau statut de commande' })
  @ApiConsumes('application/json')
  @ApiBody({ 
    description: 'Données du statut de commande',
    type: CreateOrderStatusDto,
  })
  @ApiCreatedResponse({ 
    description: 'Statut de commande créé avec succès', 
    type: OrderStatusDto 
  })
  @ApiBadRequestResponse({ 
    description: 'Données invalides',
  })
  @ApiConflictResponse({
    description: 'Un statut de commande avec ce nom existe déjà',
  })
  @ApiUnauthorizedResponse({
    description: 'Non authentifié - Token JWT manquant ou invalide',
  })
  @ApiForbiddenResponse({
    description: 'Accès refusé - Rôle insuffisant',
  })
  @ApiInternalServerErrorResponse({
    description: 'Erreur serveur interne',
  })
  create(
    @Body() createOrderStatusDto: CreateOrderStatusDto,
    @Req() req: RequestWithUser,
  ): Promise<OrderStatusDto> {
    return this.orderStatusesService.create(createOrderStatusDto, req.user.userId);
  }

  /**
   * Récupère tous les statuts de commande
   * @returns Tous les statuts de commande
   */
  @Get()
  @Role(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Récupérer tous les statuts de commande',
    description: 'Récupère tous les statuts de commande disponibles',
  })
  @ApiOkResponse({ 
    description: 'Statuts de commande récupérés avec succès', 
    type: OrderStatusDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Non authentifié - Token JWT manquant ou invalide',
  })
  @ApiForbiddenResponse({
    description: 'Accès refusé - Rôle insuffisant',
  })
  @ApiInternalServerErrorResponse({
    description: 'Erreur serveur interne',
  })
  findAll(): Promise<OrderStatusDto[]> {
    return this.orderStatusesService.findAll();
  }

  /**
   * Met à jour un statut de commande existant
   * @param id - Identifiant du statut de commande à mettre à jour
   * @param updateOrderStatusDto - Données du statut de commande à mettre à jour
   * @returns Le statut de commande mis à jour
   */
  @Patch(':id')
  @Role(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Mettre à jour un statut de commande existant',
    description: 'Met à jour un statut de commande existant avec les nouvelles données',
  })
  @ApiConsumes('application/json')
  @ApiBody({ 
    description: 'Données du statut de commande à mettre à jour',
    type: UpdateOrderStatusDto,
  })
  @ApiOkResponse({ 
    description: 'Statut de commande mis à jour avec succès', 
    type: OrderStatusDto,
  })
  @ApiNotFoundResponse({ 
    description: 'Statut de commande non trouvé',
  })
  @ApiUnauthorizedResponse({
    description: 'Non authentifié - Token JWT manquant ou invalide',
  })
  @ApiForbiddenResponse({
    description: 'Accès refusé - Rôle insuffisant',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @Req() req: RequestWithUser,
  ): Promise<OrderStatusDto> {
    return this.orderStatusesService.update(id, updateOrderStatusDto, req.user.userId);
  }

  /**
   * Supprime un statut de commande existant
   * @param id - Identifiant du statut de commande à supprimer
   * @returns Le statut de commande supprimé
   */
  @Delete(':id')
  @Role(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Supprimer un statut de commande existant',
    description: 'Supprime un statut de commande existant',
  })
  @ApiOkResponse({ 
    description: 'Statut de commande supprimé avec succès', 
    type: OrderStatusDto 
  })
  @ApiNotFoundResponse({ 
    description: 'Statut de commande non trouvé',
  })
  @ApiUnauthorizedResponse({
    description: 'Non authentifié - Token JWT manquant ou invalide',
  })
  @ApiForbiddenResponse({
    description: 'Accès refusé - Rôle insuffisant',
  })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.orderStatusesService.remove(id, req.user.userId);
  }

  /**
   * Récupère les logs des statuts de commande
   * @returns Les logs des statuts de commande
   */
  @Get('logs')
  @Role(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Récupérer les logs des statuts de commande',
    description: 'Récupère les logs des statuts de commande disponibles',
  })
  @ApiOkResponse({
    description: 'Logs des statuts de commande récupérés avec succès',
    type: OrderStatusLogDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Non authentifié - Token JWT manquant ou invalide',
  })
  @ApiForbiddenResponse({
    description: 'Accès refusé - Rôle insuffisant',
  })
  getOrderStatusLogs(): Promise<OrderStatusLogDto[]> {
    return this.orderStatusesService.getOrderStatusLogs();
  }
}
