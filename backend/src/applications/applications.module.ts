import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { UsersModule } from '../users/users.module';
import { ApplicationLogService } from './applications-log.service';
import { ApplicationLog } from './entities/application-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Application, ApplicationLog]), UsersModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService, ApplicationLogService],
  exports: [ApplicationsService, ApplicationLogService],
})
export class ApplicationsModule {}
