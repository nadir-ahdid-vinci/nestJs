/**
 * Service de gestion des récompenses
 * Gère toutes les opérations liées aux récompenses de l'application
 * Implémente les fonctionnalités CRUD avec gestion des fichiers
 * Assure la traçabilité des modifications via le système de logs
 * @class RewardsService
 */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { Reward } from './entities/reward.entity';
import { CreateRewardDto } from './dto/create-reward.dto';
import { StorageService } from '../common/services/storage.service';
import {
  InvalidRewardPhotoException,
  RewardAlreadyExistsException,
  RewardNotFoundByIdException,
  RewardHasOrdersException,
} from '../common/exceptions/reward.exceptions';
import { UsersService } from '../users/users.service';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { RewardDto } from './dto/reward.dto';
import { RewardLogDto } from './dto/reward-log.dto';
import { plainToClass } from 'class-transformer';
import * as fs from 'fs';
import { OnModuleInit } from '@nestjs/common';
import { BaseLogService } from '../common/entity-logs/base-log.service';
import { StorageDirectoryException } from '../common/exceptions/common.exceptions';
import { Action, EntityType } from '../common/entity-logs/base-log.entity';
import { UserDto } from '../users/dto/user.dto';
import * as path from 'path';

@Injectable()
export class RewardsService implements OnModuleInit {
  /**
   * Logger pour le service des récompenses
   * @private
   */
  private readonly logger = new Logger(RewardsService.name);

  /**
   * Chemin du dossier de stockage des photos de récompenses
   * @private
   */
  private readonly uploadsPath = path.join(process.cwd(), 'uploads', 'rewards');

  /**
   * Constructeur du service RewardsService
   * Initialise les dépendances nécessaires pour la gestion des récompenses
   * @param {Repository<Reward>} rewardsRepository - Repository TypeORM pour les récompenses
   * @param {StorageService} storageService - Service de gestion du stockage des fichiers
   * @param {BaseLogService} baseLogService - Service de gestion des logs
   * @param {UsersService} userService - Service de gestion des utilisateurs
   */
  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    private readonly storageService: StorageService,
    private readonly usersService: UsersService,
    private readonly baseLogService: BaseLogService,
  ) {}

  /**
   * Initialise le module en créant le dossier de stockage des photos
   * @throws {StorageDirectoryException} Si le dossier ne peut pas être créé
   */
  async onModuleInit(): Promise<void> {
    try {
      if (!fs.existsSync(this.uploadsPath)) {
        await fs.promises.mkdir(this.uploadsPath, { recursive: true });
        this.logger.log('Dossier uploads/rewards créé avec succès');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.stack || error.message : 'Unknown error';
      this.logger.error('Erreur lors de la création du dossier uploads/rewards', errorMessage);
      throw new StorageDirectoryException(this.uploadsPath, errorMessage);
    }
  }

  /**
   * Récupère toutes les récompenses, triées par date de création décroissante
   * @param {number} page - Numéro de la page (commence à 1)
   * @returns {Promise<{ items: RewardDto[], total: number, pages: number }>} Liste paginée des récompenses
   * @throws {Error} En cas d'erreur lors de la récupération
   */
  async findAll(page: number): Promise<{ items: RewardDto[]; total: number; pages: number }> {
    try {
      const itemsPerPage = 9;
      const skip = (page - 1) * itemsPerPage;

      // Récupérer le nombre total de récompenses
      const total = await this.rewardRepository.count();
      const pages = Math.ceil(total / itemsPerPage);

      // Récupérer les récompenses pour la page demandée
      const rewards = await this.rewardRepository.find({
        order: {
          createdAt: 'DESC',
        },
        skip,
        take: itemsPerPage,
      });

      this.logger.log(`Récupération des récompenses page ${page} avec succès`);

      return {
        items: rewards.map(reward => plainToClass(RewardDto, reward)),
        total,
        pages,
      };
    } catch (error: unknown) {
      this.logger.error('Erreur lors de la récupération des récompenses', error);
      throw new Error('Erreur lors de la récupération des récompenses');
    }
  }

  /**
   * Récupère une récompense par son ID
   * @param {number} id - L'identifiant de la récompense
   * @returns {Promise<RewardDto>} La récompense trouvée
   * @throws {RewardNotFoundByIdException} Si la récompense n'existe pas
   */
  async findOne(id: number): Promise<RewardDto> {
    try {
      const reward = await this.rewardRepository.findOne({ where: { id } });

      if (!reward) {
        throw new RewardNotFoundByIdException(id);
      }

      this.logger.log(`Récupération de la récompense ${id} avec succès`);

      return plainToClass(RewardDto, reward);
    } catch (error) {
      if (!(error instanceof RewardNotFoundByIdException)) {
        this.logger.error('Erreur lors de la récupération de la récompense', error);
      }
      throw error;
    }
  }

  /**
   * Crée une nouvelle récompense
   * Gère l'upload de la photo et la création du log
   * @param {CreateRewardDto} createRewardDto - Données de la récompense à créer
   * @param {number} userId - ID de l'utilisateur créant la récompense
   * @param {Express.Multer.File} file - Fichier photo de la récompense
   * @returns {Promise<RewardDto>} La récompense créée
   * @throws {RewardAlreadyExistsException} Si une récompense avec le même nom existe
   * @throws {InvalidRewardPhotoException} Si la photo est invalide
   */
  async create(
    createRewardDto: CreateRewardDto,
    adminId: number,
    file: Express.Multer.File,
  ): Promise<RewardDto> {
    try {
      // Vérifie si un fichier photo a été fourni
      if (!file) {
        throw new InvalidRewardPhotoException(
          'La photo de la récompense est invalide ou manquante',
        );
      }

      // Vérifie si une récompense avec le même nom existe déjà
      const existingReward = await this.rewardRepository.findOne({
        where: { name: createRewardDto.name },
      });

      if (existingReward) {
        throw new RewardAlreadyExistsException(createRewardDto.name);
      }

      // Récupère les informations de l'utilisateur
      const userDto = await this.usersService.findOne(adminId);
      let fileName = '';

      // Crée un queryRunner pour la transaction
      const queryRunner = this.rewardRepository.manager.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Sauvegarde la photo dans le stockage
        try {
          fileName = await this.storageService.save(file, 'rewards');
        } catch (error) {
          throw new StorageDirectoryException('rewards', error.message);
        }

        // Crée une nouvelle instance de récompense
        const reward = queryRunner.manager.create(Reward, {
          ...createRewardDto,
          photo: fileName,
        });

        // Sauvegarde la récompense en base de données
        const savedReward = await queryRunner.manager.save(reward);
        const savedRewardDto = plainToClass(RewardDto, savedReward);

        // Crée un log pour tracer la création
        await this.logRewardAction(Action.CREATE, userDto, null, savedRewardDto, queryRunner);

        await queryRunner.commitTransaction();

        this.logger.log(`Récompense "${savedReward.name}" créée avec succès`);
        return savedRewardDto;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error(
        `Erreur lors de la création de la récompense "${createRewardDto.name}": ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Met à jour une récompense existante
   * Gère la mise à jour de la photo et la création du log
   * @param {number} id - ID de la récompense à mettre à jour
   * @param {UpdateRewardDto} updateRewardDto - Nouvelles données
   * @param {number} adminId - ID de l'utilisateur effectuant la mise à jour
   * @param {Express.Multer.File} [file] - Nouvelle photo (optionnelle)
   * @returns {Promise<RewardDto>} La récompense mise à jour
   * @throws {RewardNotFoundByIdException} Si la récompense n'existe pas
   * @throws {InvalidRewardPhotoException} Si la nouvelle photo est invalide
   */
  async update(
    id: number,
    updateRewardDto: UpdateRewardDto,
    adminId: number,
    file?: Express.Multer.File,
  ): Promise<RewardDto> {
    try {
      // Recherche de la récompense à mettre à jour
      const reward = await this.rewardRepository.findOne({ where: { id } });

      if (!reward) {
        throw new RewardNotFoundByIdException(id);
      }

      // Création d'un queryRunner pour la transaction
      const queryRunner = this.rewardRepository.manager.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Récupération des informations de l'utilisateur
        const userDto = await this.usersService.findOne(adminId);

        // Vérification si le nouveau nom n'existe pas déjà
        if (updateRewardDto.name && updateRewardDto.name !== reward.name) {
          const existingReward = await this.rewardRepository.findOne({
            where: { name: updateRewardDto.name },
          });
          if (existingReward) {
            throw new RewardAlreadyExistsException(updateRewardDto.name);
          }
        }

        // Gestion de la photo
        let fileName = reward.photo;
        if (file) {
          fileName = await this.storageService.save(file, 'rewards');
        }

        // Mise à jour de l'entité
        const updatedEntity = Object.assign(reward, {
          ...updateRewardDto,
          photo: fileName,
        });

        // Sauvegarde des modifications
        const savedReward = await queryRunner.manager.save(updatedEntity);
        const savedRewardDto = plainToClass(RewardDto, savedReward);
        
        // Création du log de modification
        await this.logRewardAction(Action.UPDATE, userDto, reward, savedRewardDto, queryRunner);
        await queryRunner.commitTransaction();

        // Suppression de l'ancienne photo si nécessaire
        if (file && reward.photo && reward.photo !== fileName) {
          await this.storageService.delete(reward.photo, 'rewards');
        }

        this.logger.log(`Récompense "${savedReward.name}" mise à jour avec succès`);
        return savedRewardDto;
      } catch (error) {
        // Rollback en cas d'erreur
        await queryRunner.rollbackTransaction();
        this.logger.error(
          `Erreur lors de la mise à jour de la récompense "${updateRewardDto.name}": ${error.message}`,
        );
        throw error;
      } finally {
        // Libération du queryRunner
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error(
        `Erreur lors de la mise à jour de la récompense "${updateRewardDto.name}": ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Supprime une récompense
   * Vérifie d'abord que la récompense a été commandée au moins une fois
   * @param {number} id - ID de la récompense à supprimer
   * @param {number} adminId - ID de l'utilisateur effectuant la suppression
   * @throws {RewardNotFoundByIdException} Si la récompense n'existe pas
   * @throws {RewardHasOrdersException} Si la récompense a été commandée
   */
  async remove(id: number, adminId: number): Promise<void> {
    try {
      // Recherche de la récompense avec ses commandes associées
      const reward = await this.rewardRepository.findOne({
        where: { id },
        relations: ['orders'],
      });

      if (!reward) {
        throw new RewardNotFoundByIdException(id);
      }

      // Vérification si la récompense a été commandée au moins une fois
      const hasOrders = await this.rewardRepository
        .createQueryBuilder('reward')
        .leftJoinAndSelect('reward.orders', 'order')
        .where('reward.id = :id', { id })
        .getOne();

      if (hasOrders?.orders?.length) {
        throw new RewardHasOrdersException();
      }

      // Récupération des informations utilisateur et création du queryRunner
      const userDto = await this.usersService.findOne(adminId);
      const queryRunner = this.rewardRepository.manager.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Création du log et suppression de la récompense
        await this.logRewardAction(Action.DELETE, userDto, reward, null, queryRunner);
        await queryRunner.manager.remove(reward);
        await queryRunner.commitTransaction();

        // Suppression de la photo associée si elle existe
        if (reward.photo) {
          await this.storageService.delete(reward.photo, 'rewards');
        }
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
   * Log l'action effectuée sur une récompense
   * @param {Action} action - L'action effectuée
   * @param {UserDto} userDto - L'utilisateur effectuant l'action
   * @param {any} oldData - Données anciennes (optionnel)
   * @param {any} newData - Données nouvelles (optionnel)
   */
  private async logRewardAction(
    action: Action,
    userDto: UserDto,
    oldData?: any,
    newData?: any,
    queryRunner?: QueryRunner,
  ): Promise<void> {
    // Vérification de la présence de l'ID utilisateur
    if (!userDto.id) {
      throw new Error('User ID is required for logging');
    }

    // Création du log avec ou sans queryRunner selon le contexte
    if (queryRunner) {
      await this.baseLogService.createLogWithQueryRunner(
        queryRunner,
        EntityType.REWARD,
        action,
        userDto.id.toString(),
        oldData,
        newData,
      );
    } else {
      await this.baseLogService.createLog(
        EntityType.REWARD,
        action,
        userDto.id.toString(),
        oldData,
        newData,
      );
    }
  }

  /**
   * Récupère tous les logs liés aux récompenses
   * @returns {Promise<RewardLogDto[]>} Liste des logs des récompenses
   */
  async getRewardLogs(): Promise<RewardLogDto[]> {
    try {
      // Récupération et transformation des logs
      const logs = await this.baseLogService.getLogsByEntityType(EntityType.REWARD);
      return logs.map(log => plainToClass(RewardLogDto, log));
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des logs des récompenses:', error);
      throw error;
    }
  }
}
