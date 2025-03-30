import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { ApplicationLog, ApplicationLogAction } from '../entities/application-log.entity';
import { Application } from '../entities/application.entity';
import { User } from '../../users/entities/user.entity';
import {
  LogCreationException,
  LogQueryException,
  ApplicationNotFoundException,
  ApplicationLogNotFoundException,
} from '../../common/exceptions/application.exceptions';

/**
 * Service gérant les logs des applications
 *
 * Ce service fournit les méthodes pour :
 * - Récupérer la liste des logs avec pagination
 * - Récupérer les logs d'une application spécifique
 * - Créer un nouveau log
 */
@Injectable()
export class ApplicationLogService {
  constructor(
    @InjectRepository(ApplicationLog)
    private readonly applicationLogRepository: Repository<ApplicationLog>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}

  // ============================================
  // Méthodes privées
  // ============================================

  /**
   * Vérifie si une application existe
   */
  private async checkApplicationExists(applicationId: number): Promise<void> {
    const exists = await this.applicationRepository.exists({
      where: { id: applicationId },
    });
    if (!exists) {
      throw new ApplicationNotFoundException(applicationId);
    }
  }

  /**
   * Nettoie les données sensibles avant de les sauvegarder
   */
  private cleanSensitiveData(
    data: Record<string, any> | undefined | null,
  ): Record<string, any> | null {
    if (!data) return null;

    const cleanedData = { ...data };

    // Si l'objet contient un utilisateur, ne garder que id et name
    if (cleanedData.user) {
      cleanedData.user = {
        id: cleanedData.user.id,
        name: cleanedData.user.name,
      };
    }

    return cleanedData;
  }

  // ============================================
  // Méthodes publiques
  // ============================================

  /**
   * Crée un nouveau log d'application
   */
  async create(
    application: Application,
    user: User,
    action: ApplicationLogAction,
    previousValues?: Record<string, any>,
    newValues?: Record<string, any>,
  ): Promise<ApplicationLog> {
    try {
      // Nettoyer les données sensibles avant de les sauvegarder
      const cleanedPreviousValues = this.cleanSensitiveData(previousValues);
      const cleanedNewValues = this.cleanSensitiveData(newValues);

      const logData: DeepPartial<ApplicationLog> = {
        application,
        user,
        action,
        previousValues: cleanedPreviousValues || undefined,
        newValues: cleanedNewValues || undefined,
      };

      const log = this.applicationLogRepository.create(logData);
      return await this.applicationLogRepository.save(log);
    } catch (error) {
      throw new LogCreationException(application.id, error.message);
    }
  }

  /**
   * Récupère la liste des logs d'applications avec pagination
   */
  async findAll(page = 1, limit = 10) {
    const [items, total] = await this.applicationLogRepository.findAndCount({
      relations: ['application', 'user'],
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
   * Récupère les logs d'une application spécifique avec pagination
   */
  async findByApplication(applicationId: number, page = 1, limit = 10) {
    const [items, total] = await this.applicationLogRepository.findAndCount({
      where: { application: { id: applicationId } },
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
}
