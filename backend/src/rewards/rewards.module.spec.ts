import { Test, TestingModule } from '@nestjs/testing';
import { RewardsService } from './rewards.service';
import { StorageService } from '../common/services/storage.service';
import { BaseLogService } from '../common/entity-logs/base-log.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reward } from './entities/reward.entity';
import { UsersService } from '../users/users.service';

describe('RewardsModule', () => {
  let module: TestingModule;

  const mockRewardRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
    manager: {
      connection: {
        createQueryRunner: jest.fn(),
      },
    },
  };

  const mockStorageService = {
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockUsersService = {
    findOne: jest.fn(),
  };

  const mockBaseLogService = {
    create: jest.fn(),
    createLogWithQueryRunner: jest.fn(),
    getLogsByEntityType: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        RewardsService,
        {
          provide: getRepositoryToken(Reward),
          useValue: mockRewardRepository,
        },
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: BaseLogService,
          useValue: mockBaseLogService,
        },
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide RewardsService', () => {
    const service = module.get<RewardsService>(RewardsService);
    expect(service).toBeDefined();
  });

  it('should provide StorageService', () => {
    const service = module.get<StorageService>(StorageService);
    expect(service).toBeDefined();
  });

  it('should provide BaseLogService', () => {
    const service = module.get<BaseLogService>(BaseLogService);
    expect(service).toBeDefined();
  });
});
