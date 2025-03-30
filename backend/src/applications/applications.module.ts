import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { Application } from './entities/application.entity';
import { Criticality } from './entities/criticality.entity';
import { ApplicationLog } from './entities/application-log.entity';
import { CriticalityLog } from './entities/criticality-log.entity';
import { ApplicationLogService } from './services/application-log.service';
import { CriticalityLogService } from './services/criticality-log.service';
import { StorageService } from '../common/services/storage.service';
import { UsersModule } from '../users/users.module';
import { ApplicationStatisticsService } from './services/application-statistics.service';
import { Report } from '../reports/entities/report.entity';
import { User } from '../users/entities/user.entity';
import { CommonModule } from '../common/common.module';

/**
 * Module gérant toutes les fonctionnalités liées aux applications
 *
 * Ce module fournit :
 * - La gestion des applications (CRUD)
 * - La gestion des niveaux de criticité
 * - La gestion des logs
 * - La gestion des photos
 *
 * Dépendances :
 * - TypeOrmModule : pour la gestion de la base de données
 * - UsersModule : pour la gestion des utilisateurs
 * - StorageService : pour la gestion des fichiers
 */
@Module({
  imports: [
    UsersModule,
    CommonModule,
    TypeOrmModule.forFeature([
      Application,
      Criticality,
      ApplicationLog,
      CriticalityLog,
      Report,
      User,
    ]),
  ],
  controllers: [ApplicationsController],
  providers: [
    ApplicationsService,
    ApplicationLogService,
    CriticalityLogService,
    ApplicationStatisticsService,
    StorageService,
  ],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
