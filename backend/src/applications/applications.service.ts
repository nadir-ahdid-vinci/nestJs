import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Application } from './entities/application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UsersService } from '../users/users.service';
import { User } from 'src/users/entities/user.entity';
import { RoleEnum } from 'src/auth/roles.enum';
import { ApplicationStatus } from './entities/application.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application) private appRepository: Repository<Application>,
    private usersService: UsersService,
    private readonly dataSource: DataSource
  ) {}

  async findAll(filters: { role?: string; userId?: number }): Promise<Application[]> {
    const queryBuilder = this.appRepository.createQueryBuilder('application')
      .leftJoinAndSelect('application.owner', 'owner')
      .select(['application.id', 'application.name', 'application.description', 'application.status', 'owner.id', 'owner.username', 'application.createdAt'])
      .orderBy('application.createdAt', 'DESC');

    if (filters.role === 'HUNTER_ADMIN') {
      // No additional filters for admin, return all applications
    } else if (filters.role === 'HUNTER_DEV') {
      if (!filters.userId) {
        throw new BadRequestException('User ID is required for HUNTER_DEV role');
      }
      queryBuilder.andWhere('owner.id = :userId', { userId: filters.userId });
    } else if (filters.role === 'HUNTER') {
      queryBuilder.andWhere('application.status = :status', { status: 'OPEN' });
    } else {
      throw new BadRequestException('Invalid role');
    }

    return await queryBuilder.getMany();
  }

  async getApplicationsByRoleAndPage(page: string, role: RoleEnum, userId: number): Promise<Application[]> {
    const queryBuilder = this.appRepository.createQueryBuilder('application')
      .leftJoinAndSelect('application.owner', 'owner')
      .select(['application.id', 'application.name', 'application.description', 'application.status', 'owner.id', 'owner.username', 'application.createdAt'])
      .orderBy('application.createdAt', 'DESC');
  
    if (page === 'hunter') {
      queryBuilder.andWhere('application.status = :status', { status: ApplicationStatus.OPEN });
    } 
    else if (page === 'dev') {
      queryBuilder.andWhere('owner.id = :userId', { userId });
    } 
    else if (page === 'admin') {
    } 
    else {
      throw new BadRequestException('Page invalide.');
    }
  
    return await queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Application> {
    const application = await this.appRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.owner', 'owner')
      .select(['application.id', 'application.name', 'application.description','application.status','owner.id', 'owner.username', 'application.createdAt'])
      .where('application.id = :id', { id })
      .getOne();
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    return application;
  }

  async create(createApplicationDto: CreateApplicationDto): Promise<Application> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const owner = await this.usersService.findOne(createApplicationDto.ownerId);
      if (!owner) {
        throw new BadRequestException(`Invalid owner ID: ${createApplicationDto.ownerId}`);
      }
      const application = queryRunner.manager.create(Application, { ...createApplicationDto, owner });
      await queryRunner.manager.save(application);
      
      await queryRunner.commitTransaction();

      return application;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, updateApplicationDto: CreateApplicationDto, user: User): Promise<Application> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const application = await this.appRepository.findOne({ where: { id } });
      if (!application) {
        throw new NotFoundException(`Application with ID ${id} not found`);
      }

      const owner = await this.usersService.findOne(updateApplicationDto.ownerId);
      if (!owner) {
        throw new BadRequestException(`Invalid owner ID: ${updateApplicationDto.ownerId}`);
      }

      application.name = updateApplicationDto.name;
      application.description = updateApplicationDto.description;
      application.owner = owner;

      await queryRunner.manager.save(application);

      await queryRunner.commitTransaction();

      return application;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
