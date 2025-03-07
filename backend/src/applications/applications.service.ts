// applications/applications.service.ts (Service Applications)
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Application } from './entities/application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UsersService } from '../users/users.service';
import { ApplicationLogService } from './applications-log.service';
import { ApplicationAction } from './entities/application-log.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application) private appRepository: Repository<Application>,
    private usersService: UsersService,
    private readonly logService: ApplicationLogService,
  ) {}

  async findAll(): Promise<Application[]> {
    return await this.appRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.owner', 'owner')
      .select(['application.id', 'application.name', 'application.description','application.status','owner.id', 'owner.username', 'application.createdAt'])
      .orderBy('application.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: number): Promise<Application> {
    const application = await this.appRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.owner', 'owner')
      .select(['application.id', 'application.name', 'application.status', 'owner.id', 'owner.username'])
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
