// applications/applications.service.ts (Service Applications)
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UsersService } from '../users/users.service';
import { ApplicationLogService } from './applications-log.service';
import { ApplicationAction } from './entities/application-log.entity';
import { User } from 'src/users/entities/user.entity';
import { RoleEnum } from 'src/auth/roles.enum';
import { ApplicationStatus } from './entities/application.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application) private appRepository: Repository<Application>,
    private usersService: UsersService,
    private readonly logService: ApplicationLogService,
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
      // ✅ Hunter ne voit que les applications ouvertes
      queryBuilder.andWhere('application.status = :status', { status: ApplicationStatus.OPEN });
    } 
    else if (page === 'dev') {
      // ✅ Dev ne voit que ses propres applications
      queryBuilder.andWhere('owner.id = :userId', { userId });
    } 
    else if (page === 'admin') {
      // ✅ Admin voit toutes les applications (pas de filtre)
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

  async findByUser(userId: number): Promise<Application[]> {
    return await this.appRepository
      .createQueryBuilder('application')
      .select(['application.id', 'application.name', 'application.description','application.status','owner.id', 'owner.username', 'application.createdAt'])
      .leftJoinAndSelect('application.owner', 'owner')
      .where('owner.id = :userId', { userId })
      .getMany();
  }

  async findAllForHunters(): Promise<Application[]> {
    return await this.appRepository
      .createQueryBuilder('application')
      .select(['application.id', 'application.name', 'application.description','application.status','owner.id', 'owner.username', 'application.createdAt'])
      .leftJoinAndSelect('application.owner', 'owner')
      .where('application.status = :status', { status: 'OPEN' })
      .getMany();
  }
  
  async create(createApplicationDto: CreateApplicationDto, user: User): Promise<Application> {
    const owner = await this.usersService.findOne(createApplicationDto.ownerId);
    if (!owner) {
      throw new BadRequestException(`Invalid owner ID: ${createApplicationDto.ownerId}`);
    }
    const application = this.appRepository.create({ ...createApplicationDto, owner });
    await this.appRepository.save(application);
    await this.logService.createLog(application, ApplicationAction.CREATED, user);
    return application;
  }

  async update(id: number, updateApplicationDto: CreateApplicationDto, user: User): Promise<Application> {
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
    await this.appRepository.save(application);
    await this.logService.createLog(application, ApplicationAction.UPDATED, user);
    return application;
  }
}
