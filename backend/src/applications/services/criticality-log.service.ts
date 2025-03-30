import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { CriticalityLog, CriticalityLogAction } from '../entities/criticality-log.entity';
import { Criticality } from '../entities/criticality.entity';
import { User } from '../../users/entities/user.entity';
import { UserDto } from '../../users/dto/user.dto';
import {
  LogCreationException,
  LogQueryException,
  CriticalityNotFoundException,
  CriticalityLogNotFoundException,
} from '../../common/exceptions/application.exceptions';

/**
 * Service gérant les logs des niveaux de criticité
 *
 * Ce service fournit les méthodes pour :
 * - Récupérer la liste des logs avec pagination
 * - Récupérer les logs d'une criticité spécifique
 * - Créer un nouveau log
 */
@Injectable()
export class CriticalityLogService {
  constructor(
    @InjectRepository(CriticalityLog)
    private readonly criticalityLogRepository: Repository<CriticalityLog>,
    @InjectRepository(Criticality)
    private readonly criticalityRepository: Repository<Criticality>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ============================================
  // Méthodes privées
  // ============================================

  /**
   * Vérifie si une criticité existe
   */
  private async checkCriticalityExists(criticalityId: number): Promise<void> {
    const exists = await this.criticalityRepository.exists({
      where: { id: criticalityId },
    });
    if (!exists) {
      throw new CriticalityNotFoundException(criticalityId);
    }
  }

  // ============================================
  // Méthodes publiques
  // ============================================

  /**
   * Crée un nouveau log de criticité
   */
  async create(criticality: Criticality, userDto: UserDto): Promise<CriticalityLog> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userDto.id },
      });

      if (!user) {
        throw new Error(`Utilisateur avec l'ID ${userDto.id} non trouvé`);
      }

      const logData: DeepPartial<CriticalityLog> = {
        criticality,
        user,
        action: CriticalityLogAction.CREATED,
        newValues: {
          name: criticality.name,
          low: criticality.low,
          medium: criticality.medium,
          high: criticality.high,
          critical: criticality.critical,
        },
      };

      const log = this.criticalityLogRepository.create(logData);
      return await this.criticalityLogRepository.save(log);
    } catch (error) {
      throw new LogCreationException(criticality.id, error.message);
    }
  }

  /**
   * Récupère la liste des logs de criticités avec pagination
   */
  async findAll(page = 1, limit = 10) {
    const [items, total] = await this.criticalityLogRepository.findAndCount({
      relations: ['criticality', 'user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Récupère les logs d'une criticité spécifique avec pagination
   */
  async findByCriticality(criticalityId: number, page = 1, limit = 10) {
    const [items, total] = await this.criticalityLogRepository.findAndCount({
      where: { criticality: { id: criticalityId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(
    oldCriticality: Criticality,
    newCriticality: Criticality,
    userDto: UserDto,
  ): Promise<CriticalityLog> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userDto.id },
      });

      if (!user) {
        throw new Error(`Utilisateur avec l'ID ${userDto.id} non trouvé`);
      }

      const logData: DeepPartial<CriticalityLog> = {
        criticality: newCriticality,
        user,
        action: CriticalityLogAction.UPDATED,
        previousValues: {
          name: oldCriticality.name,
          low: oldCriticality.low,
          medium: oldCriticality.medium,
          high: oldCriticality.high,
          critical: oldCriticality.critical,
        },
        newValues: {
          name: newCriticality.name,
          low: newCriticality.low,
          medium: newCriticality.medium,
          high: newCriticality.high,
          critical: newCriticality.critical,
        },
      };

      const log = this.criticalityLogRepository.create(logData);
      return await this.criticalityLogRepository.save(log);
    } catch (error) {
      throw new LogCreationException(newCriticality.id, error.message);
    }
  }
}
