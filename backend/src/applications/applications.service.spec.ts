import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Application, ApplicationStatus } from './entities/application.entity';
import { UsersService } from '../users/users.service';
import { DataSource, Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RoleEnum } from '../auth/roles.enum';
import { CreateApplicationDto } from './dto/create-application.dto';
import { User } from '../users/entities/user.entity';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let repository: Repository<Application>;
  let usersService: UsersService;
  let dataSource: DataSource;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
  };

  const mockApplication = {
    id: 1,
    name: 'Test App',
    description: 'Test Description',
    status: ApplicationStatus.OPEN,
    owner: { id: 1, username: 'testuser' },
    createdAt: new Date(),
  };

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@test.com',
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      create: jest.fn(),
      save: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: getRepositoryToken(Application),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
            findOne: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
          },
        },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    repository = module.get<Repository<Application>>(getRepositoryToken(Application));
    usersService = module.get<UsersService>(UsersService);
    dataSource = module.get<DataSource>(DataSource);
  });

  describe('findAll', () => {
    it('should return all applications for HUNTER_ADMIN', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockApplication]);
      
      const result = await service.findAll({ role: 'HUNTER_ADMIN' });
      
      expect(result).toEqual([mockApplication]);
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('should return user applications for HUNTER_DEV', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockApplication]);
      
      const result = await service.findAll({ role: 'HUNTER_DEV', userId: 1 });
      
      expect(result).toEqual([mockApplication]);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('owner.id = :userId', { userId: 1 });
    });

    it('should throw error for HUNTER_DEV without userId', async () => {
      await expect(service.findAll({ role: 'HUNTER_DEV' }))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return an application', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockApplication);
      
      const result = await service.findOne(1);
      
      expect(result).toEqual(mockApplication);
    });

    it('should throw NotFoundException when application not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);
      
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto: CreateApplicationDto = {
      name: 'Test App',
      description: 'Test Description',
      ownerId: 1,
    };

    it('should create an application', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser as User);
      mockQueryRunner.manager.create.mockReturnValue(mockApplication);
      mockQueryRunner.manager.save.mockResolvedValue(mockApplication);

      const result = await service.create(createDto);

      expect(result).toEqual(mockApplication);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      jest.spyOn(usersService, 'findOne').mockRejectedValue(new Error());

      await expect(service.create(createDto)).rejects.toThrow();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateDto: CreateApplicationDto = {
      name: 'Updated App',
      description: 'Updated Description',
      ownerId: 1,
    };

    it('should update an application', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockApplication as Application);
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser as User);
      mockQueryRunner.manager.save.mockResolvedValue({ ...mockApplication, ...updateDto });

      const result = await service.update(1, updateDto, mockUser as User);

      expect(result).toBeDefined();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should throw NotFoundException when application not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.update(1, updateDto, mockUser as User))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getApplicationsByRoleAndPage', () => {
    it('should return open applications for hunter page', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockApplication]);
      
      const result = await service.getApplicationsByRoleAndPage('hunter', RoleEnum.HUNTER, 1);
      
      expect(result).toEqual([mockApplication]);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'application.status = :status',
        { status: ApplicationStatus.OPEN }
      );
    });

    it('should return user applications for dev page', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockApplication]);
      
      const result = await service.getApplicationsByRoleAndPage('dev', RoleEnum.HUNTER_DEV, 1);
      
      expect(result).toEqual([mockApplication]);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('owner.id = :userId', { userId: 1 });
    });

    it('should return all applications for admin page', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockApplication]);
      
      const result = await service.getApplicationsByRoleAndPage('admin', RoleEnum.HUNTER_ADMIN, 1);
      
      expect(result).toEqual([mockApplication]);
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid page', async () => {
      await expect(
        service.getApplicationsByRoleAndPage('invalid', RoleEnum.HUNTER, 1)
      ).rejects.toThrow(BadRequestException);
    });
  });
});
