// applications/applications.service.ts (Service Applications)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application) private appRepository: Repository<Application>,
    private usersService: UsersService,
  ) {}

  findAll(): Promise<Application[]> {
    return this.appRepository.find({ relations: ['owner'] });
  }

  async findOne(id: number): Promise<Application> {
    const application = await this.appRepository.findOne({ where: { id }, relations: ['owner'] });
    if (!application) {
      throw new Error(`Application with id ${id} not found`);
    }
    return application;
  }

  async create(createApplicationDto: CreateApplicationDto): Promise<Application> {
    const owner = await this.usersService.findOne(createApplicationDto.ownerId);
    if (!owner) {
      throw new Error(`Owner with id ${createApplicationDto.ownerId} not found`);
    }

    const application = this.appRepository.create({
      ...createApplicationDto,
      owner,
    });

    return this.appRepository.save(application);
  }
}
