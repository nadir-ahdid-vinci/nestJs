import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
  Logger,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { Application, ApplicationStatus } from './entities/application.entity';
import { Repository, Not } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { CreateCriticalityDto } from './dto/create-criticality.dto';
import { Criticality } from './entities/criticality.entity';
import * as fs from 'fs';
import { ApplicationLogService } from './services/application-log.service';
import { CriticalityLogService } from './services/criticality-log.service';
import { ApplicationLog, ApplicationLogAction } from './entities/application-log.entity';
import { CriticalityLog, CriticalityLogAction } from './entities/criticality-log.entity';
import { ApplicationStatisticsService } from './services/application-statistics.service';
import { StorageService } from '../common/services/storage.service';
import {
  ApplicationNotFoundException,
  ApplicationAlreadyExistsException,
  InvalidApplicationStatusException,
  UnauthorizedApplicationAccessException,
  CriticalityNotFoundException,
  CriticalityAlreadyExistsException,
  InvalidLogoException,
  MissingLogoException,
  InvalidApplicationPageException,
  ApplicationUpdateException,
  ApplicationLogsException,
} from '../common/exceptions/application.exceptions';
import { StorageDirectoryException } from '../common/exceptions/common.exceptions';
import { User } from '../users/entities/user.entity';
import { UpdateCriticalityDto } from './dto/update-criticality.dto';
import { UserRole } from '../users/enums/user-role.enum';
import { UserDto } from '../users/dto/user.dto';

/**
 * Service gérant toutes les opérations liées aux applications et aux criticités
 *
 * Ce service fournit les méthodes pour :
 * - La gestion des applications (CRUD)
 * - La gestion des niveaux de criticité
 * - La gestion des logs
 * - La gestion des photos
 */
@Injectable()
export class ApplicationsService implements OnModuleInit {
  private readonly logger = new Logger(ApplicationsService.name);
  private readonly uploadsPath = './uploads/logos';

  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    @InjectRepository(Criticality)
    private readonly criticalityRepository: Repository<Criticality>,
    @InjectRepository(ApplicationLog)
    private readonly applicationLogRepository: Repository<ApplicationLog>,
    @InjectRepository(CriticalityLog)
    private readonly criticalityLogRepository: Repository<CriticalityLog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UsersService,
    private readonly applicationLogService: ApplicationLogService,
    private readonly criticalityLogService: CriticalityLogService,
    private readonly applicationStatisticsService: ApplicationStatisticsService,
    private readonly storageService: StorageService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      if (!fs.existsSync(this.uploadsPath)) {
        await fs.promises.mkdir(this.uploadsPath, { recursive: true });
        this.logger.log('Dossier uploads/logos créé avec succès');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.stack || error.message : 'Unknown error';
      this.logger.error('Erreur lors de la création du dossier uploads/logos', errorMessage);
      throw new StorageDirectoryException(this.uploadsPath, errorMessage);
    }
  }

  async findAll(
    page: string,
    userId?: number,
    paginationOptions?: { page: number; limit: number },
  ): Promise<{ items: Application[]; total: number; page: number; totalPages: number }> {
    try {
      // Validation de la page
      if (page && !['hunter', 'dev', 'admin'].includes(page)) {
        throw new InvalidApplicationPageException(page);
      }

      const query = this.applicationRepository
        .createQueryBuilder('application')
        .leftJoinAndSelect('application.user', 'user')
        .select([
          'application.id',
          'application.name',
          'application.description',
          'application.createdAt',
          'application.status',
          'application.scope',
          'application.logo',
          'application.criticality',
          'user.id',
          'user.email',
          'user.name',
        ])
        .orderBy('application.createdAt', 'DESC');

      if (page === 'hunter') {
        query.andWhere('application.status = :status', { status: ApplicationStatus.OPEN });
      } else if (page === 'dev') {
        query.andWhere('user.id = :userId', { userId });
      } else if (page === 'admin') {
        // Admin can see all applications
      } else {
        throw new BadRequestException('Mauvaise page');
      }

      if (paginationOptions) {
        query.skip(paginationOptions.page * paginationOptions.limit).take(paginationOptions.limit);
      }

      const [items, total] = await query.getManyAndCount();

      return {
        items,
        total,
        page: paginationOptions?.page || 0,
        totalPages: Math.ceil(total / (paginationOptions?.limit || items.length)),
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number): Promise<any> {
    try {
      const application = await this.applicationRepository.findOne({
        where: { id },
        relations: ['user', 'criticality'],
      });

      if (!application) {
        throw new ApplicationNotFoundException(id);
      }

      try {
        const [statistics, hallOfFame] = await Promise.all([
          this.applicationStatisticsService.getReportStatistics(id),
          this.applicationStatisticsService.getHallOfFame(id),
        ]);

        return {
          ...application,
          statistics,
          hallOfFame,
        };
      } catch (error) {
        // Si c'est une erreur technique (pas un résultat vide), on la propage
        if (error instanceof ApplicationNotFoundException) {
          throw error;
        }
        this.logger.error(
          'Erreur lors de la récupération des statistiques ou du hall of fame',
          error,
        );
        return {
          ...application,
          statistics: { byLevel: [], total: 0 },
          hallOfFame: [],
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async findAllCriticality(): Promise<Criticality[]> {
    try {
      const criticalities = await this.criticalityRepository
        .createQueryBuilder('criticality')
        .select([
          'criticality.id',
          'criticality.name',
          'criticality.low',
          'criticality.medium',
          'criticality.high',
          'criticality.critical',
        ])
        .orderBy('criticality.name', 'ASC')
        .getMany();

      if (!criticalities.length) {
        throw new CriticalityNotFoundException("Aucun niveau de criticité n'a été trouvé");
      }

      return criticalities;
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des criticités', error.stack);
      throw error;
    }
  }

  async findOneCriticality(id: number): Promise<Criticality> {
    try {
      const criticality = await this.criticalityRepository
        .createQueryBuilder('criticality')
        .select([
          'criticality.id',
          'criticality.name',
          'criticality.low',
          'criticality.medium',
          'criticality.high',
          'criticality.critical',
        ])
        .where('criticality.id = :id', { id })
        .getOne();

      if (!criticality) {
        throw new CriticalityNotFoundException(id);
      }

      return criticality;
    } catch (error) {
      if (error instanceof CriticalityNotFoundException) {
        throw error;
      }
      throw new HttpException(
        'Erreur lors de la récupération de la criticité',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(
    createApplicationDto: CreateApplicationDto,
    idCreatedByUser: number,
    file?: Express.Multer.File,
  ): Promise<Application> {
    if (!file) {
      throw new MissingLogoException();
    }

    // Vérifier si une application avec le même nom existe déjà
    const existingApp = await this.applicationRepository.findOne({
      where: { name: createApplicationDto.name },
    });

    if (existingApp) {
      throw new ApplicationAlreadyExistsException(createApplicationDto.name);
    }

    try {
      // Sauvegarder le logo d'abord
      const fileName = await this.storageService.save(file, 'logos');

      // Trouver la criticité
      const criticality = await this.criticalityRepository.findOne({
        where: { id: createApplicationDto.criticalityId },
      });

      if (!criticality) {
        throw new CriticalityNotFoundException(createApplicationDto.criticalityId);
      }

      const createdByUserDto = await this.userService.findOne(idCreatedByUser);
      const createdByUser = await this.userRepository.findOne({
        where: { id: createdByUserDto.id },
        relations: ['orders', 'cgu', 'applications', 'reports', 'reportLogs'],
      });

      if (!createdByUser) {
        throw new NotFoundException(`Utilisateur avec l'ID ${idCreatedByUser} non trouvé`);
      }

      // Trouver l'utilisateur propriétaire
      const ownerDto = await this.userService.findOne(createApplicationDto.userId);
      const owner = await this.userRepository.findOne({
        where: { id: ownerDto.id },
        relations: ['orders', 'cgu', 'applications', 'reports', 'reportLogs'],
      });

      if (!owner) {
        throw new NotFoundException(
          `Utilisateur avec l'ID ${createApplicationDto.userId} non trouvé`,
        );
      }

      // Créer l'application avec le logo et la criticité
      const application = this.applicationRepository.create({
        name: createApplicationDto.name,
        description: createApplicationDto.description,
        scope: createApplicationDto.scope,
        status: ApplicationStatus.CLOSED,
        logo: fileName,
        user: owner,
        criticality,
      });

      // Sauvegarder l'application
      const savedApplication = await this.applicationRepository.save(application);

      // Créer le log avec l'utilisateur qui a créé l'application
      await this.applicationLogService.create(
        savedApplication,
        createdByUser,
        ApplicationLogAction.CREATED,
        undefined,
        {
          name: savedApplication.name,
          description: savedApplication.description,
          scope: savedApplication.scope,
          status: savedApplication.status,
          logo: savedApplication.logo,
        },
      );

      return savedApplication;
    } catch (error) {
      // Si une erreur se produit, supprimer le logo s'il a été sauvegardé
      if (error.code !== 'ENOENT' && file) {
        try {
          await this.storageService.delete(file.filename, 'logos');
        } catch (deleteError) {
          this.logger.error('Erreur lors de la suppression du logo:', deleteError);
        }
      }
      throw error;
    }
  }

  async createCriticality(
    createCriticalityDto: CreateCriticalityDto,
    userDto: UserDto,
  ): Promise<Criticality> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userDto.id },
      });

      if (!user) {
        throw new NotFoundException(`Utilisateur avec l'ID ${userDto.id} non trouvé`);
      }

      const existingCriticality = await this.criticalityRepository.findOne({
        where: { name: createCriticalityDto.name },
      });

      if (existingCriticality) {
        throw new CriticalityAlreadyExistsException(createCriticalityDto.name);
      }

      const criticality = this.criticalityRepository.create(createCriticalityDto);
      const savedCriticality = await this.criticalityRepository.save(criticality);

      await this.criticalityLogService.create(savedCriticality, userDto);

      return savedCriticality;
    } catch (error) {
      throw error;
    }
  }

  async updateCriticality(
    id: number,
    updateCriticalityDto: UpdateCriticalityDto,
    userDto: UserDto,
  ): Promise<Criticality> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userDto.id },
      });

      if (!user) {
        throw new NotFoundException(`Utilisateur avec l'ID ${userDto.id} non trouvé`);
      }

      const criticality = await this.criticalityRepository.findOne({ where: { id } });

      if (!criticality) {
        throw new CriticalityNotFoundException(id);
      }

      if (updateCriticalityDto.name && updateCriticalityDto.name !== criticality.name) {
        const existingCriticality = await this.criticalityRepository.findOne({
          where: { name: updateCriticalityDto.name, id: Not(id) },
        });

        if (existingCriticality) {
          throw new CriticalityAlreadyExistsException(updateCriticalityDto.name);
        }
      }

      const updatedCriticality = await this.criticalityRepository.save({
        ...criticality,
        ...updateCriticalityDto,
      });

      await this.criticalityLogService.update(criticality, updatedCriticality, userDto);

      return updatedCriticality;
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: number,
    updateApplicationDto: UpdateApplicationDto,
    userId: number,
  ): Promise<Application> {
    try {
      let application = await this.findOne(id);
      const userDto = await this.userService.findOne(userId);
      const user = await this.userRepository.findOne({
        where: { id: userDto.id },
        relations: ['orders', 'cgu', 'applications', 'reports', 'reportLogs'],
      });

      if (!user) {
        throw new UnauthorizedApplicationAccessException(userId, id);
      }

      // Vérifier si le nouveau nom n'est pas déjà utilisé par une autre application
      if (updateApplicationDto.name) {
        const existingApp = await this.applicationRepository.findOne({
          where: { name: updateApplicationDto.name, id: Not(id) },
        });

        if (existingApp) {
          throw new ApplicationAlreadyExistsException(updateApplicationDto.name);
        }
      }

      // Vérifier et mettre à jour la criticité si nécessaire
      if (updateApplicationDto.criticalityId) {
        const criticality = await this.criticalityRepository.findOne({
          where: { id: updateApplicationDto.criticalityId },
        });
        if (!criticality) {
          throw new CriticalityNotFoundException(updateApplicationDto.criticalityId);
        }
        application.criticality = criticality;
      }

      // Mettre à jour l'application
      Object.assign(application, updateApplicationDto);
      const updatedApplication = await this.applicationRepository.save(application);

      return updatedApplication;
    } catch (error) {
      throw error;
    }
  }

  async getLogs(page = 1, limit = 10) {
    try {
      const result = await this.applicationLogService.findAll(page, limit);
      if (!result.items || result.total === 0) {
        throw new ApplicationLogsException();
      }
      return result;
    } catch (error) {
      if (error instanceof ApplicationLogsException) {
        throw error;
      }
      throw new ApplicationLogsException();
    }
  }

  async getApplicationLogs(id: number, page = 1, limit = 10) {
    try {
      const application = await this.findOne(id);
      const result = await this.applicationLogService.findByApplication(
        application.id,
        page,
        limit,
      );
      if (!result.items || result.total === 0) {
        throw new ApplicationLogsException(id);
      }
      return result;
    } catch (error) {
      if (error instanceof ApplicationLogsException) {
        throw error;
      }
      throw new ApplicationLogsException(id);
    }
  }
}
