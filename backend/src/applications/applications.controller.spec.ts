import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { Criticality } from './entities/criticality.entity';
import { UsersService } from '../users/users.service';
import { ApplicationLogService } from './services/application-log.service';
import { ApplicationLog } from './entities/application-log.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { ApplicationStatus } from './entities/application.entity';

describe('ApplicationsController', () => {
  let controller: ApplicationsController;
  let service: ApplicationsService;

  // Mock des données de test
  const mockApplications: Application[] = [
    {
      id: 1,
      name: 'Test App 1',
      description: 'Description 1',
      status: ApplicationStatus.OPEN,
      scope: 'Scope 1',
      user: { id: 1, email: 'dev@test.com' } as any,
      criticality: { id: 1, name: 'High' } as any,
      createdAt: new Date(),
      logo: 'logo1.jpg',
      reports: [],
      logs: [],
    },
    {
      id: 2,
      name: 'Test App 2',
      description: 'Description 2',
      status: ApplicationStatus.CLOSED,
      scope: 'Scope 2',
      user: { id: 2, email: 'dev2@test.com' } as any,
      criticality: { id: 1, name: 'Medium' } as any,
      createdAt: new Date(),
      logo: 'logo2.jpg',
      reports: [],
      logs: [],
    },
  ];

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(mockApplications),
      getOne: jest.fn().mockResolvedValue(null),
    })),
  };

  const mockUsersService = {
    findOne: jest.fn(),
  };

  const mockApplicationLogService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByApplication: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [
        {
          provide: ApplicationsService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            getLogs: jest.fn(),
            getApplicationLogs: jest.fn(),
            findAllCriticality: jest.fn(),
            findOneCriticality: jest.fn(),
            createCriticality: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Application),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Criticality),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(ApplicationLog),
          useValue: mockRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ApplicationLogService,
          useValue: mockApplicationLogService,
        },
      ],
    }).compile();

    controller = module.get<ApplicationsController>(ApplicationsController);
    service = module.get<ApplicationsService>(ApplicationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all applications for ADMIN role', async () => {
      const req = {
        user: { role: UserRole.ADMIN, userId: 1 },
      };

      jest.spyOn(service, 'findAll').mockResolvedValue(mockApplications);

      const result = await controller.findAll('admin', req);

      expect(result).toEqual(mockApplications);
      expect(service.findAll).toHaveBeenCalledWith(1, 'admin');
    });

    it('should return only open applications for HUNTER role', async () => {
      const req = {
        user: { role: UserRole.HUNTER, userId: 2 },
      };

      const openApplications = mockApplications.filter(
        app => app.status === ApplicationStatus.OPEN,
      );
      jest.spyOn(service, 'findAll').mockResolvedValue(openApplications);

      const result = await controller.findAll('hunter', req);

      expect(result).toEqual(openApplications);
      expect(service.findAll).toHaveBeenCalledWith(2, 'hunter');
    });

    it('should return only user applications for DEV role', async () => {
      const req = {
        user: { role: UserRole.DEV, userId: 1 },
      };

      const userApplications = mockApplications.filter(app => app.user.id === req.user.userId);
      jest.spyOn(service, 'findAll').mockResolvedValue(userApplications);

      const result = await controller.findAll('dev', req);

      expect(result).toEqual(userApplications);
      expect(service.findAll).toHaveBeenCalledWith(1, 'dev');
    });

    it('should throw error for unauthorized access', async () => {
      const req = {
        user: { role: UserRole.HUNTER, id: 1 },
      };

      await expect(controller.findAll('admin', req)).rejects.toThrow('Unauthorized');
    });
  });

  describe('findOne', () => {
    it('should return application for every user', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockApplications[0]);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockApplications[0]);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });
});
