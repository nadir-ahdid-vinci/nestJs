import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationLog, ApplicationAction } from './entities/application-log.entity';
import { Application } from './entities/application.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ApplicationLogService {
    constructor(
        @InjectRepository(ApplicationLog)
        private readonly logRepository: Repository<ApplicationLog>,
    ) {}

    async createLog(application: Application, action: ApplicationAction, user?: User, details?: any) {
        const log = this.logRepository.create({
            application,
            action,
            user,
            details,
        });
        await this.logRepository.save(log);
    }

    async getLogsByApplication(applicationId: number): Promise<ApplicationLog[]> {
        return await this.logRepository
            .createQueryBuilder('log')
            .leftJoinAndSelect('log.application', 'application')
            .leftJoinAndSelect('log.user', 'user')
            .where('application.id = :applicationId', { applicationId })
            .orderBy('log.createdAt', 'DESC')
            .getMany();
        }      
}
