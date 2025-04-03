/**
 * Service de gestion des commandes
 * Gère toutes les opérations liées aux commandes de l'application
 * Implémente les fonctionnalités CRUD avec gestion des transactions
 * Assure la traçabilité des modifications via le système de logs
 * @class OrdersService
 */
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderDto } from './dto/order.dto';
import { Order } from './entities/order.entity';
import { Repository, QueryRunner } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RewardsService } from '../rewards/rewards.service';
import { UsersService } from '../users/users.service';
import { OrderStatusesService } from './order-statuses/order-statuses.service';
import { plainToClass } from 'class-transformer';
import { BaseLogService } from '../common/entity-logs/base-log.service';
import { Action, EntityType } from '../common/entity-logs/base-log.entity';
import { UserDto } from '../users/dto/user.dto';
import { OrderLogDto } from './dto/order-log.dto';
import {
  OrderAlreadyConfirmedException,
  OrderNotFoundException,
} from '../common/exceptions/order.exceptions';
import { LoggerService } from '../logger/logger.service';
import { User } from '../users/entities/user.entity';
import { Reward } from '../rewards/entities/reward.entity';

@Injectable()
export class OrdersService {
  /**
   * Logger pour le service des commandes
   * @private
   */
  private readonly logger: LoggerService;

  /**
   * Constructeur du service OrdersService
   * Initialise les dépendances nécessaires pour la gestion des commandes
   * @param {Repository<Order>} orderRepository - Repository TypeORM pour les commandes
   * @param {RewardsService} rewardService - Service de gestion des récompenses
   * @param {UsersService} userService - Service de gestion des utilisateurs
   * @param {OrderStatusesService} orderStatusService - Service de gestion des statuts de commande
   * @param {BaseLogService} baseLogService - Service de gestion des logs
   * @param {LoggerService} loggerService - Service de gestion des logs
   */
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private rewardService: RewardsService,
    private userService: UsersService,
    private orderStatusService: OrderStatusesService,
    private readonly baseLogService: BaseLogService,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext('OrdersService');
  }

  /**
   * Crée une nouvelle commande
   * @param {CreateOrderDto} createOrderDto - Données de la commande à créer
   * @param {number} userId - ID de l'utilisateur créant la commande
   * @returns {Promise<OrderDto>} La commande créée
   * @throws {BadRequestException} Si l'utilisateur n'a pas assez de points ou si la récompense n'est pas disponible
   */
  async create(createOrderDto: CreateOrderDto, userId: number): Promise<OrderDto> {
    try {
      const rewardDto = await this.rewardService.findOne(createOrderDto.rewardId);
      const userDto = await this.userService.findOne(userId);

      if (!rewardDto.available || userDto.points < rewardDto.points) {
        this.logger.error('Points insuffisants ou récompense non disponible');
        throw new BadRequestException('Points insuffisants ou récompense non disponible');
      }

      const pendingStatus = await this.orderStatusService.findOneByName('PENDING');
      const queryRunner = this.orderRepository.manager.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Récupérer l'entité User complète
        const user = await queryRunner.manager.findOne(User, {
          where: { id: userId },
        });

        if (!user) {
          throw new BadRequestException('Utilisateur non trouvé');
        }

        // Récupérer l'entité Reward complète
        const reward = await queryRunner.manager.findOne(Reward, {
          where: { id: createOrderDto.rewardId },
        });

        if (!reward) {
          throw new BadRequestException('Récompense non trouvée');
        }

        // Création de la commande
        const order = this.orderRepository.create({
          reward,
          user,
          status: pendingStatus,
          createdAt: new Date(),
        });
        const savedOrder = await queryRunner.manager.save(order);

        // Mise à jour des points de l'utilisateur
        user.points -= reward.points;
        await queryRunner.manager.save(User, user);

        // Mise à jour de la quantité de la récompense
        reward.quantity -= 1;
        await queryRunner.manager.save(Reward, reward);

        // Création du log
        await this.logOrderAction(Action.CREATE, userDto, null, savedOrder, queryRunner);

        await queryRunner.commitTransaction();

        const orderDto = plainToClass(OrderDto, savedOrder);
        this.logger.info(`Commande #${savedOrder.id} créée avec succès`);
        return orderDto;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Erreur lors de la création de la commande: ${errorMessage}`);
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Erreur lors de la création de la commande: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Récupère toutes les commandes avec pagination
   * @param {number} page - Numéro de la page (commence à 1)
   * @returns {Promise<{ items: OrderDto[], total: number, pages: number }>} Liste paginée des commandes
   */
  async findAll(page: number): Promise<{ items: OrderDto[]; total: number; pages: number }> {
    try {
      const itemsPerPage = 10;
      const skip = (page - 1) * itemsPerPage;

      const total = await this.orderRepository.count();
      const pages = Math.ceil(total / itemsPerPage);

      const orders = await this.orderRepository.find({
        relations: ['user', 'reward', 'status'],
        order: {
          createdAt: 'DESC',
        },
        skip,
        take: itemsPerPage,
      });

      this.logger.info(`Récupération des commandes page ${page} avec succès`);
      return {
        items: orders.map(order => plainToClass(OrderDto, order)),
        total,
        pages,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Erreur lors de la récupération des commandes: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Récupère une commande par son ID
   * @param {number} orderId - L'identifiant de la commande
   * @returns {Promise<OrderDto>} La commande trouvée
   * @throws {OrderNotFoundException} Si la commande n'existe pas
   */
  async findOne(orderId: number): Promise<OrderDto> {
    try {
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
        relations: ['user', 'reward', 'status'],
      });

      if (!order) {
        this.logger.error(`Commande #${orderId} non trouvée`);
        throw new OrderNotFoundException(orderId);
      }

      this.logger.info(`Récupération de la commande #${orderId} avec succès`);
      return plainToClass(OrderDto, order);
    } catch (error) {
      if (!(error instanceof OrderNotFoundException)) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Erreur lors de la récupération de la commande: ${errorMessage}`);
      }
      throw error;
    }
  }

  /**
   * Met à jour une commande existante
   * @param {number} orderId - ID de la commande à mettre à jour
   * @param {UpdateOrderDto} updateOrderDto - Nouvelles données
   * @param {number} adminId - ID de l'administrateur effectuant la mise à jour
   * @returns {Promise<OrderDto>} La commande mise à jour
   * @throws {OrderNotFoundException} Si la commande n'existe pas
   * @throws {OrderAlreadyConfirmedException} Si la commande est déjà confirmée
   */
  async update(orderId: number, adminId: number): Promise<OrderDto> {
    try {
      const admin = await this.userService.findOne(adminId);
      const existingOrder = await this.findOne(orderId);

      if (!existingOrder) {
        this.logger.error(`Commande #${orderId} non trouvée`);
        throw new OrderNotFoundException(orderId);
      }

      if (existingOrder.status.name === 'CONFIRMED') {
        this.logger.error(`Commande #${orderId} déjà confirmée`);
        throw new OrderAlreadyConfirmedException(orderId);
      }

      const confirmedStatus = await this.orderStatusService.findOneByName('CONFIRMED');
      const queryRunner = this.orderRepository.manager.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const oldOrder = { ...existingOrder };
        existingOrder.status = confirmedStatus;
        const updatedOrder = await queryRunner.manager.save(existingOrder);
        await this.logOrderAction(Action.UPDATE, admin, oldOrder, updatedOrder, queryRunner);
        await queryRunner.commitTransaction();

        const orderDto = plainToClass(OrderDto, updatedOrder);
        this.logger.info(`Commande #${orderId} mise à jour avec succès`);
        return orderDto;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `Erreur lors de la mise à jour de la commande #${orderId}: ${errorMessage}`,
        );
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      if (
        !(
          error instanceof OrderNotFoundException || error instanceof OrderAlreadyConfirmedException
        )
      ) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `Erreur lors de la mise à jour de la commande #${orderId}: ${errorMessage}`,
        );
      }
      throw error;
    }
  }

  /**
   * Supprime une commande
   * @param {number} id - ID de la commande à supprimer
   * @param {number} userId - ID de l'administrateur effectuant la suppression
   * @throws {OrderNotFoundException} Si la commande n'existe pas
   */
  async remove(id: number, userId: number): Promise<void> {
    try {
      const admin = await this.userService.findOne(userId);
      const existingOrder = await this.orderRepository.findOne({
        where: { id },
        relations: ['user', 'reward', 'status'],
      });

      if (!existingOrder) {
        this.logger.error(`Commande #${id} non trouvée`);
        throw new OrderNotFoundException(id);
      }

      const queryRunner = this.orderRepository.manager.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        await this.logOrderAction(Action.DELETE, admin, existingOrder, null, queryRunner);

        if (existingOrder.status.name === 'CONFIRMED') {
          const user = existingOrder.user;
          user.points += existingOrder.reward.points;
          await this.userService.update(user.id, { points: user.points });

          const reward = existingOrder.reward;
          await this.rewardService.update(
            reward.id,
            {
              ...reward,
              quantity: reward.quantity + 1,
            },
            userId,
          );
        }

        await queryRunner.manager.remove(existingOrder);
        await queryRunner.commitTransaction();
        this.logger.info(`Commande #${id} supprimée avec succès`);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Erreur lors de la suppression de la commande #${id}: ${errorMessage}`);
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      if (!(error instanceof OrderNotFoundException)) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Erreur lors de la suppression de la commande #${id}: ${errorMessage}`);
      }
      throw error;
    }
  }

  /**
   * Log l'action effectuée sur une commande
   * @param {Action} action - L'action effectuée
   * @param {UserDto} userDto - L'utilisateur effectuant l'action
   * @param {any} oldData - Données anciennes (optionnel)
   * @param {any} newData - Données nouvelles (optionnel)
   * @param {QueryRunner} queryRunner - QueryRunner pour la transaction
   */
  private async logOrderAction(
    action: Action,
    userDto: UserDto,
    oldData?: any,
    newData?: any,
    queryRunner?: QueryRunner,
  ): Promise<void> {
    if (!userDto.id) {
      throw new Error('User ID is required for logging');
    }

    if (queryRunner) {
      await this.baseLogService.createLogWithQueryRunner(
        queryRunner,
        EntityType.ORDER,
        action,
        userDto.id,
        oldData,
        newData,
      );
      this.logger.info('Log créé avec succès');
    } else {
      await this.baseLogService.createLog(EntityType.ORDER, action, userDto.id, oldData, newData);
      this.logger.info('Log créé avec succès');
    }
  }

  /**
   * Récupère tous les logs liés aux commandes
   * @returns {Promise<OrderLogDto[]>} Liste des logs des commandes
   */
  async getOrderLogs(): Promise<OrderLogDto[]> {
    try {
      const logs = await this.baseLogService.getLogsByEntityType(EntityType.ORDER);
      this.logger.info('Récupération des logs des commandes avec succès');
      return logs.map(log => plainToClass(OrderLogDto, log));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Erreur lors de la récupération des logs des commandes: ${errorMessage}`);
      throw error;
    }
  }
}
