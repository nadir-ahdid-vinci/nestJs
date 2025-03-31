import { BadRequestException, Injectable, Logger, Inject } from '@nestjs/common';
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
import { ConfigService } from '@nestjs/config';
import { Action, EntityType } from '../common/entity-logs/base-log.entity';
import { UserDto } from '../users/dto/user.dto';
import { OrderLogDto } from './dto/order-log.dto';
import {
  OrderAlreadyConfirmedException,
  OrderNotFoundException,
} from '../common/exceptions/order.exceptions';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private rewardService: RewardsService,
    private userService: UsersService,
    private orderStatusService: OrderStatusesService,
    private readonly baseLogService: BaseLogService,
    private readonly configService: ConfigService,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: number): Promise<OrderDto> {
    try {
      const reward = await this.rewardService.findOne(createOrderDto.rewardId);
      const user = await this.userService.findOne(userId);

      if (!reward.available || user.points < reward.points) {
        throw new BadRequestException('Not enough points or reward not available');
      }

      const pendingStatus = await this.orderStatusService.findOneByName('PENDING');

      const queryRunner = this.orderRepository.manager.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const order = this.orderRepository.create({
          reward,
          user,
          status: pendingStatus,
          createdAt: new Date(),
        });

        const savedOrder = await queryRunner.manager.save(order);

        await this.logOrderAction(Action.CREATE, user, null, savedOrder, queryRunner);

        user.points -= reward.points;
        await this.userService.update(userId, { points: user.points });

        await this.rewardService.update(
          reward.id,
          {
            ...reward,
            quantity: reward.quantity - 1,
          },
          userId,
        );

        await queryRunner.commitTransaction();

        const orderDto = plainToClass(OrderDto, savedOrder);
        this.logger.log(`Commande #${savedOrder.id} créée avec succès`);

        return orderDto;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger.error(
          `Erreur lors de la création de la commande: ${error.message}`,
          error.stack,
        );
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error(`Erreur lors de la création de la commande: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(page: number = 1): Promise<{ items: OrderDto[]; total: number; pages: number }> {
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

      return {
        items: orders.map(order => plainToClass(OrderDto, order)),
        total,
        pages,
      };
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des commandes: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(orderId: number): Promise<OrderDto> {
    try {
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
        relations: ['user', 'reward', 'status'],
      });

      if (!order) {
        throw new OrderNotFoundException(orderId);
      }

      return plainToClass(OrderDto, order);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération de la commande: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(
    orderId: number,
    updateOrderDto: UpdateOrderDto,
    adminId: number,
  ): Promise<OrderDto> {
    try {
      const admin = await this.userService.findOne(adminId);
      const existingOrder = await this.findOne(orderId);

      if (!existingOrder) {
        throw new OrderNotFoundException(orderId);
      }

      if (existingOrder.status.name === 'CONFIRMED') {
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
        this.logger.log(`Commande #${orderId} mise à jour avec succès`);

        return orderDto;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger.error(
          `Erreur lors de la mise à jour de la commande: ${error.message}`,
          error.stack,
        );
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error(
        `Erreur lors de la mise à jour de la commande: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async remove(id: number, userId: number): Promise<void> {
    try {
      const admin = await this.userService.findOne(userId);
      const existingOrder = await this.orderRepository.findOne({
        where: { id },
        relations: ['user', 'reward', 'status'],
      });

      if (!existingOrder) {
        throw new BadRequestException(`Order with ID ${id} not found`);
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

        this.logger.log(`Commande #${id} supprimée avec succès`);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger.error(
          `Erreur lors de la suppression de la commande: ${error.message}`,
          error.stack,
        );
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error(
        `Erreur lors de la suppression de la commande: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

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
    } else {
      await this.baseLogService.createLog(
        EntityType.ORDER,
        action,
        userDto.id,
        oldData,
        newData,
      );
    }
  }

  async getOrderLogs(): Promise<OrderLogDto[]> {
    try {
      const logs = await this.baseLogService.getLogsByEntityType(EntityType.ORDER);
      return logs.map(log => plainToClass(OrderLogDto, log));
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des logs des commandes:', error.stack);
      throw error;
    }
  }
}
