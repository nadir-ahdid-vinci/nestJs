import { Test, TestingModule } from '@nestjs/testing';
import { RewardsService } from './rewards.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reward } from './entities/reward.entity';
import { StorageService } from '../common/services/storage.service';
import { UsersService } from '../users/users.service';
import { BaseLogService } from '../common/entity-logs/base-log.service';
import { QueryRunner } from 'typeorm';
import { plainToClass } from 'class-transformer';
import {
  RewardNotFoundByIdException,
  RewardAlreadyExistsException,
  InvalidRewardPhotoException,
  RewardHasOrdersException,
} from '../common/exceptions/reward.exceptions';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UserDto } from '../users/dto/user.dto';
import { Action, EntityType } from '../common/entity-logs/base-log.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { StorageDirectoryException } from '../common/exceptions/common.exceptions';
import { BadRequestException } from '@nestjs/common';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { RewardLogDto } from './dto/reward-log.dto';

describe('RewardsService', () => {
  let service: RewardsService;

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    },
  } as unknown as QueryRunner;

  const mockRewardRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
    manager: {
      connection: {
        createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
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
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<RewardsService>(RewardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated rewards', async () => {
      // Mock data
      const mockRewards = [
        {
          id: 1,
          name: 'Test Reward 1',
          description: 'Test Description 1',
          points: 100,
          createdAt: new Date(),
        },
        {
          id: 2,
          name: 'Test Reward 2',
          description: 'Test Description 2',
          points: 200,
          createdAt: new Date(),
        },
      ];

      // Setup mocks
      mockRewardRepository.count.mockResolvedValue(2);
      mockRewardRepository.find.mockResolvedValue(mockRewards);

      // Execute
      const result = await service.findAll(1);

      // Assert
      expect(result).toEqual({
        items: mockRewards.map(reward => plainToClass(Reward, reward)),
        total: 2,
        pages: 1,
      });
      expect(mockRewardRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 9,
      });
      expect(mockRewardRepository.count).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a reward when it exists', async () => {
      // Mock data
      const mockReward = {
        id: 1,
        name: 'Test Reward',
        description: 'Test Description',
        points: 100,
        createdAt: new Date(),
      };

      // Setup mocks
      mockRewardRepository.findOne.mockResolvedValue(mockReward);

      // Execute
      const result = await service.findOne(1);

      // Assert
      expect(result).toEqual(plainToClass(Reward, mockReward));
      expect(mockRewardRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw RewardNotFoundByIdException when reward does not exist', async () => {
      // Setup mocks
      mockRewardRepository.findOne.mockResolvedValue(null);

      // Execute and Assert
      await expect(service.findOne(1)).rejects.toThrow(RewardNotFoundByIdException);
      expect(mockRewardRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('create', () => {
    const mockCreateRewardDto: CreateRewardDto = {
      name: 'New Reward',
      description: 'New Description',
      points: 300,
      quantity: 10,
      available: true,
    };

    const mockFile = {
      fieldname: 'photo',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test'),
      size: 1024,
    } as Express.Multer.File;

    const mockUserDto: UserDto = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      points: 100,
      score: 100,
      role: UserRole.HUNTER,
    };

    it('should create a reward successfully', async () => {
      // Setup mocks
      mockRewardRepository.findOne.mockResolvedValue(null);
      mockUsersService.findOne.mockResolvedValue(mockUserDto);
      mockStorageService.save.mockResolvedValue('test.jpg');
      const mockSavedReward = {
        id: 1,
        ...mockCreateRewardDto,
        photo: 'test.jpg',
        createdAt: new Date(),
      };

      (mockQueryRunner.manager.create as jest.Mock).mockReturnValue(mockCreateRewardDto);
      (mockQueryRunner.manager.save as jest.Mock).mockResolvedValue(mockSavedReward);

      // Execute
      const result = await service.create(mockCreateRewardDto, 1, mockFile);

      // Assert
      expect(result).toEqual(plainToClass(Reward, mockSavedReward));
      expect(mockRewardRepository.findOne).toHaveBeenCalledWith({
        where: { name: mockCreateRewardDto.name },
      });
      expect(mockStorageService.save).toHaveBeenCalledWith(mockFile, 'rewards');
      expect(mockBaseLogService.createLogWithQueryRunner).toHaveBeenCalled();
    });

    it('should throw RewardAlreadyExistsException when reward name exists', async () => {
      // Setup mocks
      mockRewardRepository.findOne.mockResolvedValue({
        id: 1,
        name: mockCreateRewardDto.name,
      });

      // Execute and Assert
      await expect(service.create(mockCreateRewardDto, 1, mockFile)).rejects.toThrow(
        RewardAlreadyExistsException,
      );
    });

    it('should throw InvalidRewardPhotoException when no file is provided', async () => {
      // Setup mocks
      mockRewardRepository.findOne.mockResolvedValue(null);

      // Execute and Assert
      await expect(service.create(mockCreateRewardDto, 1, '' as unknown as Express.Multer.File)).rejects.toThrow(
        InvalidRewardPhotoException,
      );
    });

    it('should throw StorageDirectoryException when file storage fails', async () => {
      // Setup mocks
      mockRewardRepository.findOne.mockResolvedValue(null);
      mockStorageService.save.mockRejectedValue(new Error('Storage error'));

      // Create an invalid file object
      const invalidFile = {
        fieldname: 'photo',
        originalname: '',
        encoding: '7bit',
        mimetype: '',
        buffer: Buffer.from(''),
        size: 0,
      } as Express.Multer.File;

      // Execute and Assert
      await expect(service.create(mockCreateRewardDto, 1, invalidFile)).rejects.toThrow(
        StorageDirectoryException,
      );
    });

    it('should throw StorageDirectoryException when file is invalid', async () => {
      // Setup mocks
      mockRewardRepository.findOne.mockResolvedValue(null);
      mockStorageService.save.mockRejectedValue(new Error('Type de fichier non autorisé'));

      // Create an invalid file object
      const invalidFile = {
        fieldname: 'photo',
        originalname: '',
        encoding: '7bit',
        mimetype: 'application/pdf',
        buffer: Buffer.from(''),
        size: 0,
      } as Express.Multer.File;

      // Execute and Assert
      await expect(service.create(mockCreateRewardDto, 1, invalidFile)).rejects.toThrow(
        StorageDirectoryException,
      );
    });

    it('should throw StorageDirectoryException when file is empty', async () => {
      // Setup mocks
      mockRewardRepository.findOne.mockResolvedValue(null);
      mockStorageService.save.mockRejectedValue(new Error('Fichier vide'));

      // Create an empty file object
      const emptyFile = {
        fieldname: 'photo',
        originalname: '',
        encoding: '7bit',
        mimetype: '',
        buffer: Buffer.from(''),
        size: 0,
      } as Express.Multer.File;

      // Execute and Assert
      await expect(service.create(mockCreateRewardDto, 1, emptyFile)).rejects.toThrow(
        StorageDirectoryException,
      );
    });
  });

  describe('update', () => {
    const mockUpdateRewardDto: UpdateRewardDto = {
      name: 'Updated Reward',
      description: 'Updated Description',
      points: 400,
      quantity: 20,
      available: false,
    };

    const mockFile = {
      fieldname: 'photo',
      originalname: 'updated.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test'),
      size: 1024,
    } as Express.Multer.File;

    const mockUserDto: UserDto = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      points: 100,
      score: 100,
      role: UserRole.HUNTER,
    };

    const mockExistingReward = {
      id: 1,
      name: 'Old Reward',
      description: 'Old Description',
      points: 300,
      quantity: 10,
      available: true,
      photo: 'old.jpg',
      createdAt: new Date(),
    };

    it('should update a reward successfully', async () => {
      // Setup mocks
      mockRewardRepository.findOne
        .mockResolvedValueOnce(mockExistingReward) // First call for finding the reward to update
        .mockResolvedValueOnce(null); // Second call for checking if new name exists
      mockUsersService.findOne.mockResolvedValue(mockUserDto);
      mockStorageService.save.mockResolvedValue('updated.jpg');
      const mockUpdatedReward = {
        ...mockExistingReward,
        ...mockUpdateRewardDto,
        photo: 'updated.jpg',
      };

      (mockQueryRunner.manager.save as jest.Mock).mockResolvedValue(mockUpdatedReward);

      // Execute
      const result = await service.update(1, mockUpdateRewardDto, 1, mockFile);

      // Assert
      expect(result).toEqual(plainToClass(Reward, mockUpdatedReward));
      expect(mockRewardRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockRewardRepository.findOne).toHaveBeenCalledWith({
        where: { name: mockUpdateRewardDto.name },
      });
      expect(mockStorageService.save).toHaveBeenCalledWith(mockFile, 'rewards');
      expect(mockBaseLogService.createLogWithQueryRunner).toHaveBeenCalled();
    });

    it('should throw RewardNotFoundByIdException when reward does not exist', async () => {
      // Setup mocks
      mockRewardRepository.findOne.mockResolvedValue(null);

      // Execute and Assert
      await expect(service.update(1, mockUpdateRewardDto, 1, mockFile)).rejects.toThrow(
        RewardNotFoundByIdException,
      );
      expect(mockRewardRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw RewardAlreadyExistsException when new name already exists', async () => {
      // Setup mocks
      mockRewardRepository.findOne
        .mockResolvedValueOnce(mockExistingReward) // First call for finding the reward to update
        .mockResolvedValueOnce({ id: 2, name: mockUpdateRewardDto.name }); // Second call for checking if new name exists
      mockUsersService.findOne.mockResolvedValue(mockUserDto);

      // Create a DTO with a different name
      const updateDtoWithNewName = {
        ...mockUpdateRewardDto,
        name: 'Different Name',
      };

      // Execute and Assert
      await expect(service.update(1, updateDtoWithNewName, 1, mockFile)).rejects.toThrow(
        RewardAlreadyExistsException,
      );
      expect(mockRewardRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockRewardRepository.findOne).toHaveBeenCalledWith({
        where: { name: updateDtoWithNewName.name },
      });
    });

    it('should throw StorageDirectoryException when file storage fails', async () => {
      // Setup mocks
      mockRewardRepository.findOne
        .mockResolvedValueOnce(mockExistingReward) // First call for finding the reward to update
        .mockResolvedValueOnce(null); // Second call for checking if new name exists
      mockUsersService.findOne.mockResolvedValue(mockUserDto);
      mockStorageService.save.mockRejectedValue(new StorageDirectoryException('rewards', 'Storage error'));

      // Execute and Assert
      await expect(service.update(1, mockUpdateRewardDto, 1, mockFile)).rejects.toThrow(
        StorageDirectoryException,
      );
      expect(mockRewardRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockRewardRepository.findOne).toHaveBeenCalledWith({
        where: { name: mockUpdateRewardDto.name },
      });
      expect(mockStorageService.save).toHaveBeenCalledWith(mockFile, 'rewards');
    });

    it('should throw BadRequestException when file is invalid', async () => {
      // Reset mocks
      mockRewardRepository.findOne.mockReset();
      mockStorageService.save.mockReset();
      
      // Configure mocks - Important: in update method, the service makes two calls to findOne
      mockRewardRepository.findOne.mockImplementation((params) => {
        if (params.where.id === 1) {
          return Promise.resolve(mockExistingReward);
        } else if (params.where.name === mockUpdateRewardDto.name) {
          return Promise.resolve(null);
        }
        return Promise.resolve(null);
      });
      
      mockUsersService.findOne.mockResolvedValue(mockUserDto);
      mockStorageService.save.mockRejectedValue(new BadRequestException('Type de fichier non autorisé'));

      // Create an invalid file object
      const invalidFile = {
        fieldname: 'photo',
        originalname: '',
        encoding: '7bit',
        mimetype: 'application/pdf',
        buffer: Buffer.from(''),
        size: 0,
      } as Express.Multer.File;

      // Execute and Assert
      await expect(service.update(1, mockUpdateRewardDto, 1, invalidFile)).rejects.toThrow(
        BadRequestException,
      );
      
      // Check that findOne was called with correct params
      expect(mockRewardRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      
      // Check that storageService.save was called with correct params
      expect(mockStorageService.save).toHaveBeenCalledWith(invalidFile, 'rewards');
    });

    it('should update reward without changing photo when no file is provided', async () => {
      // Reset mocks
      mockRewardRepository.findOne.mockReset();
      mockStorageService.save.mockReset();
      
      // Configure mocks - Important: in update method, the service makes two calls to findOne
      mockRewardRepository.findOne.mockImplementation((params) => {
        if (params.where.id === 1) {
          return Promise.resolve(mockExistingReward);
        } else if (params.where.name === mockUpdateRewardDto.name) {
          return Promise.resolve(null);
        }
        return Promise.resolve(null);
      });
      
      mockUsersService.findOne.mockResolvedValue(mockUserDto);
      const mockUpdatedReward = {
        ...mockExistingReward,
        ...mockUpdateRewardDto,
      };

      (mockQueryRunner.manager.save as jest.Mock).mockResolvedValue(mockUpdatedReward);

      // Execute
      const result = await service.update(1, mockUpdateRewardDto, 1);

      // Assert
      expect(result).toEqual(plainToClass(Reward, mockUpdatedReward));
      
      // Check that findOne was called with id
      expect(mockRewardRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      
      // Check that storageService.save was not called
      expect(mockStorageService.save).not.toHaveBeenCalled();
      expect(mockBaseLogService.createLogWithQueryRunner).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    const mockUserDto: UserDto = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      points: 100,
      score: 100,
      role: UserRole.HUNTER,
    };

    const mockExistingReward = {
      id: 1,
      name: 'Test Reward',
      description: 'Test Description',
      points: 300,
      quantity: 10,
      available: true,
      photo: 'test.jpg',
      createdAt: new Date(),
      orders: [],
    };

    beforeEach(() => {
      // Add delete method to mockStorageService
      mockStorageService.delete = jest.fn();
      // Add createQueryBuilder method to mockRewardRepository
      mockRewardRepository.createQueryBuilder = jest.fn();
      // Add remove method to mockQueryRunner.manager
      mockQueryRunner.manager.remove = jest.fn();
    });

    it('should remove a reward successfully', async () => {
      // Reset mocks
      mockRewardRepository.findOne.mockReset();
      
      // Configure mocks
      mockRewardRepository.findOne.mockImplementation(params => {
        if (params.where && params.where.id === 1) {
          return Promise.resolve({...mockExistingReward, orders: []});
        }
        return Promise.resolve(null);
      });
      
      mockRewardRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({...mockExistingReward, orders: []}),
      });
      
      mockUsersService.findOne.mockResolvedValue(mockUserDto);

      // Execute
      await service.remove(1, 1);

      // Assert
      expect(mockRewardRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['orders'],
      });
      expect(mockBaseLogService.createLogWithQueryRunner).toHaveBeenCalled();
      expect(mockQueryRunner.manager.remove).toHaveBeenCalled();
      expect(mockStorageService.delete).toHaveBeenCalledWith('test.jpg', 'rewards');
    });

    it('should throw RewardNotFoundByIdException when reward does not exist', async () => {
      // Reset mocks
      mockRewardRepository.findOne.mockReset();
      
      // Configure mocks
      mockRewardRepository.findOne.mockResolvedValue(null);

      // Execute and Assert
      await expect(service.remove(1, 1)).rejects.toThrow(RewardNotFoundByIdException);
      expect(mockRewardRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['orders'],
      });
    });

    it('should throw RewardHasOrdersException when reward has orders', async () => {
      // Reset mocks
      mockRewardRepository.findOne.mockReset();
      
      // Configure mocks
      mockRewardRepository.findOne.mockImplementation(params => {
        if (params.where && params.where.id === 1) {
          return Promise.resolve({...mockExistingReward, orders: []});
        }
        return Promise.resolve(null);
      });
      // Configure createQueryBuilder to return a reward with orders
      mockRewardRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({...mockExistingReward, orders: [{id: 1}]}),
      });

      // Execute and Assert
      await expect(service.remove(1, 1)).rejects.toThrow(RewardHasOrdersException);
    });
  });

  describe('getRewardLogs', () => {
    it('should return reward logs', async () => {
      // Mock logs
      const mockLogs = [
        {
          id: 1,
          entityType: 'REWARD',
          entityId: 1,
          action: 'CREATE',
          userId: 1,
          oldData: null,
          newData: { id: 1, name: 'Test Reward' },
          createdAt: new Date(),
        },
        {
          id: 2,
          entityType: 'REWARD',
          entityId: 1,
          action: 'UPDATE',
          userId: 1,
          oldData: { id: 1, name: 'Test Reward' },
          newData: { id: 1, name: 'Updated Reward' },
          createdAt: new Date(),
        },
      ];

      // Setup mocks
      mockBaseLogService.getLogsByEntityType = jest.fn().mockResolvedValue(mockLogs);

      // Execute
      const result = await service.getRewardLogs();

      // Assert
      expect(result).toEqual(mockLogs);
      expect(mockBaseLogService.getLogsByEntityType).toHaveBeenCalledWith('REWARD');
    });

    it('should rethrow error when getLogsByEntityType fails', async () => {
      // Setup mocks
      const error = new Error('Database error');
      mockBaseLogService.getLogsByEntityType = jest.fn().mockRejectedValue(error);

      // Execute and Assert
      await expect(service.getRewardLogs()).rejects.toThrow(error);
      expect(mockBaseLogService.getLogsByEntityType).toHaveBeenCalledWith('REWARD');
    });
  });
});
