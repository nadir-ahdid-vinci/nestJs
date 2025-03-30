/**
 * Contrôleur gérant les commandes de l'application
 * Fournit les endpoints pour la gestion complète des commandes (CRUD)
 * Implémente la sécurité via JWT et le contrôle des rôles
 * Gère l'upload des photos via un intercepteur dédié
 * @class OrdersController
 */
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/enums/user-role.enum';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { OrderDto } from './dto/order.dto';
import { Role } from '../auth/roles.decorator';

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

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Crée une nouvelle commande
   * Endpoint: POST /orders
   * Accessible aux chasseurs de bugs
   * @param createOrderDto - Données de la commande à créer
   * @returns La commande créée
   */
  @Post()
  @Role(UserRole.HUNTER)
  @ApiOperation({ summary: 'Créer une nouvelle commande' })
  @ApiOkResponse({
    description: 'Commande créée avec succès',
    type: OrderDto,
  })
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: RequestWithUser,
  ): Promise<OrderDto> {
    return await this.ordersService.create(createOrderDto, req.user.userId);
  }


  @Get()
  @Role(UserRole.ADMIN)
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Patch(':id')
  @Role(UserRole.ADMIN)
  update(
    @Param('id') orderId: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @Req() req: RequestWithUser,
  ) {
    return this.ordersService.update(+orderId, updateOrderDto, req.user.userId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    return this.ordersService.remove(+id, req.user.userId);
  }
}
