import { Injectable, Logger } from '@nestjs/common';
import { CreateOrderStatusDto } from './dto/create-order-status.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from './entities/order-status.entity';
import { QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseLogService } from '../../common/entity-logs/base-log.service';
import { ConfigService } from '@nestjs/config';
import {
  InvalidOrderStatusDtoException,
  OrderStatusAlreadyExistsException,
  OrderStatusNotFoundException,
  OrderStatusInUseException,
  OrderStatusNameNotFoundException,
} from '../../common/exceptions/order-status.exceptions';
import { UsersService } from '../../users/users.service';
import { plainToClass } from 'class-transformer';
import { OrderStatusDto } from './dto/order-status.dto';
import { Action, EntityType } from '../../common/entity-logs/base-log.entity';
import { UserDto } from '../../users/dto/user.dto';
import { OrderStatusLogDto } from './dto/order-status-log.dto';

@Injectable()
export class OrderStatusesService {
  /**
   * Logger pour le service des récompenses
   * @private
   */
  private readonly logger = new Logger(OrderStatusesService.name);

  /**
   * Constructeur du service
   * @param {Repository<OrderStatus>} orderStatusRepository - Le repository des statuts de commande
   * @param {BaseLogService} baseLogService - Le service de journalisation des actions
   * @param {ConfigService} configService - Le service de configuration
   * @param {UsersService} usersService - Le service des utilisateurs
   */
  constructor(
    @InjectRepository(OrderStatus)
    private readonly orderStatusRepository: Repository<OrderStatus>,
    private readonly baseLogService: BaseLogService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Crée un nouveau statut de commande
   * @param {CreateOrderStatusDto} createOrderStatusDto - Les données du statut de commande à créer
   * @param {number} userId - L'ID de l'utilisateur effectuant la création
   * @returns {Promise<OrderStatusDto>} Le statut de commande créé
   * @throws {InvalidOrderStatusDtoException} Si les données sont invalides
   * @throws {OrderStatusAlreadyExistsException} Si le nom du statut de commande existe déjà
   */
  async create(
    createOrderStatusDto: CreateOrderStatusDto,
    userId: number,
  ): Promise<OrderStatusDto> {
    try {
      const existingOrderStatus = await this.findOneByName(createOrderStatusDto.name);

      if (existingOrderStatus) {
        throw new OrderStatusAlreadyExistsException(createOrderStatusDto.name);
      }

      const userDto = await this.usersService.findOne(userId);
      const queryRunner = this.orderStatusRepository.manager.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const orderStatus = queryRunner.manager.create(OrderStatus, createOrderStatusDto);
        const savedOrderStatus = await queryRunner.manager.save(orderStatus);
        const savedOrderStatusDto = plainToClass(OrderStatusDto, savedOrderStatus);

        await this.logOrderStatusAction(
          Action.CREATE,
          userDto,
          null,
          savedOrderStatusDto,
          queryRunner,
        );
        await queryRunner.commitTransaction();

        this.logger.log(`Statut de commande "${savedOrderStatusDto.name}" créé avec succès`);
        return savedOrderStatusDto;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error(`Erreur lors de la création du statut de commande : ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupère tous les statuts de commande
   * @returns {Promise<OrderStatusDto[]>} Les statuts de commande
   * @throws {Error} Si une erreur survient lors de la récupération des statuts de commande
   */
  async findAll(): Promise<OrderStatusDto[]> {
    try {
      const orderStatuses = await this.orderStatusRepository.find();
      return orderStatuses.map(orderStatus => plainToClass(OrderStatusDto, orderStatus));
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des statuts de commande : ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Récupère un statut de commande par son nom
   * @param {string} name - Le nom du statut de commande à rechercher
   * @returns {Promise<OrderStatusDto>} Le statut de commande trouvé
   * @throws {OrderStatusNotFoundException} Si le statut de commande n'existe pas
   */
  async findOneByName(name: string): Promise<OrderStatusDto> {
    try {
      const orderStatus = await this.orderStatusRepository.findOne({
        where: { name },
      });

      if (!orderStatus) {
        throw new OrderStatusNameNotFoundException(name);
      }

      return plainToClass(OrderStatusDto, orderStatus);
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération du statut de commande : ${error.message}`);
      throw error;
    }
  }

  /**
   * Met à jour un statut de commande existant
   * @param {number} id - L'ID du statut de commande à mettre à jour
   * @param {UpdateOrderStatusDto} updateOrderStatusDto - Les nouvelles données du statut de commande
   * @param {number} userId - L'ID de l'utilisateur effectuant la mise à jour
   * @returns {Promise<OrderStatusDto>} Le statut de commande mis à jour
   * @throws {InvalidOrderStatusDtoException} Si les données sont invalides
   * @throws {OrderStatusNotFoundException} Si le statut de commande n'existe pas
   */
  async update(
    id: number,
    updateOrderStatusDto: UpdateOrderStatusDto,
    userId: number,
  ): Promise<OrderStatusDto> {
    try {
      const orderStatus = await this.orderStatusRepository.findOne({ where: { id } });

      if (!orderStatus) {
        throw new OrderStatusNotFoundException(id);
      }

      const queryRunner = this.orderStatusRepository.manager.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const userDto = await this.usersService.findOne(userId);

        if (updateOrderStatusDto.name && updateOrderStatusDto.name !== orderStatus.name) {
          const existingOrderStatus = await this.orderStatusRepository.findOne({
            where: { name: updateOrderStatusDto.name },
          });
          if (existingOrderStatus) {
            throw new OrderStatusAlreadyExistsException(updateOrderStatusDto.name);
          }
        }

        const updatedEntity = Object.assign(orderStatus, updateOrderStatusDto);
        const savedOrderStatus = await queryRunner.manager.save(updatedEntity);
        const savedOrderStatusDto = plainToClass(OrderStatusDto, savedOrderStatus);
        await this.logOrderStatusAction(
          Action.UPDATE,
          userDto,
          orderStatus,
          savedOrderStatusDto,
          queryRunner,
        );
        await queryRunner.commitTransaction();

        return savedOrderStatusDto;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Supprime un statut de commande existant
   * @param {number} id - L'ID du statut de commande à supprimer
   * @param {number} userId - L'ID de l'utilisateur effectuant la suppression
   * @returns {Promise<void>} - Rien n'est retourné
   * @throws {OrderStatusNotFoundException} Si le statut de commande n'existe pas
   * @throws {OrderStatusInUseException} Si le statut est utilisé par des commandes
   */
  async remove(id: number, userId: number): Promise<void> {
    try {
      const orderStatus = await this.orderStatusRepository.findOne({
        where: { id },
        relations: ['orders'],
      });

      if (!orderStatus) {
        throw new OrderStatusNotFoundException(id);
      }

      if (orderStatus.orders && orderStatus.orders.length > 0) {
        throw new OrderStatusInUseException(id);
      }

      const userDto = await this.usersService.findOne(userId);
      const queryRunner = this.orderStatusRepository.manager.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        await this.logOrderStatusAction(Action.DELETE, userDto, orderStatus, null, queryRunner);
        await queryRunner.manager.remove(orderStatus);
        await queryRunner.commitTransaction();

        this.logger.log(`Statut de commande #${id} supprimé avec succès`);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression du statut de commande : ${error.message}`);
      throw error;
    }
  }

  /**
   * Log l'action effectuée sur un statut de commande
   * @param {Action} action - L'action effectuée
   * @param {UserDto} userDto - L'utilisateur effectuant l'action
   * @param {any} oldData - Données anciennes (optionnel)
   * @param {any} newData - Données nouvelles (optionnel)
   */
  private async logOrderStatusAction(
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
        EntityType.ORDER_STATUS,
        action,
        userDto.id,
        oldData,
        newData,
      );
    } else {
      await this.baseLogService.createLog(
        EntityType.ORDER_STATUS,
        action,
        userDto.id,
        oldData,
        newData,
      );
    }
  }

  /**
   * Récupère tous les logs liés aux statuts de commande
   * @returns {Promise<OrderStatusLogDto[]>} Liste des logs des statuts de commande
   */
  async getOrderStatusLogs(): Promise<OrderStatusLogDto[]> {
    try {
      const logs = await this.baseLogService.getLogsByEntityType(EntityType.ORDER_STATUS);
      return logs.map(log => plainToClass(OrderStatusLogDto, log));
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des logs des statuts de commande:', error);
      throw error;
    }
  }
}
