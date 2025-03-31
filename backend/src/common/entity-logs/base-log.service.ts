import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { BaseLog, Action, EntityType } from './base-log.entity';

@Injectable()
export class BaseLogService {
  constructor(
    @InjectRepository(BaseLog)
    private readonly logRepository: Repository<BaseLog>,
  ) {}

  async createLog(
    entityType: EntityType,
    action: Action,
    userId: number,
    oldData?: any,
    newData?: any,
  ): Promise<BaseLog> {
    const log = this.logRepository.create({
      entityType,
      action,
      userId,
      oldData,
      newData,
    });

    return this.logRepository.save(log);
  }

  async createLogWithQueryRunner(
    queryRunner: QueryRunner,
    entityType: EntityType,
    action: Action,
    userId: number,
    oldData?: any,
    newData?: any,
  ): Promise<BaseLog> {
    const log = queryRunner.manager.create(BaseLog, {
      entityType,
      action,
      userId,
      oldData,
      newData,
    });

    return queryRunner.manager.save(log);
  }

  async getLogsByEntityType(entityType: EntityType): Promise<BaseLog[]> {
    return this.logRepository.find({
      where: { entityType },
      order: { createdAt: 'DESC' },
    });
  }

  async getLogsByUserId(userId: number): Promise<BaseLog[]> {
    return this.logRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getLogsByAction(action: Action): Promise<BaseLog[]> {
    return this.logRepository.find({
      where: { action },
      order: { createdAt: 'DESC' },
    });
  }
}
