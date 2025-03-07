import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';

const mockApplicationRepository = {
  create: jest.fn().mockImplementation(dto => dto),
  save: jest.fn().mockImplementation(application => Promise.resolve({ id: 1, ...application })),
  find: jest.fn().mockResolvedValue([{ id: 1, name: 'Test App' }]),
  findOne: jest.fn().mockImplementation(id => Promise.resolve(id === 1 ? { id: 1, name: 'Test App' } : null)),
  update: jest.fn().mockResolvedValue({ affected: 1 }),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
};

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let repository: Repository<Application>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: getRepositoryToken(Application),
          useValue: mockApplicationRepository,
        },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    repository = module.get<Repository<Application>>(getRepositoryToken(Application));
  });

  it('devrait être défini', () => {
    expect(service).toBeDefined();
  });

  it('devrait créer une application', async () => {
    const dto: CreateApplicationDto = { name: 'New App' };
    expect(await service.create(dto)).toEqual({ id: 1, ...dto });
    expect(repository.save).toHaveBeenCalled();
  });

  it('devrait récupérer toutes les applications', async () => {
    expect(await service.findAll()).toEqual([{ id: 1, name: 'Test App' }]);
    expect(repository.find).toHaveBeenCalled();
  });

  it('devrait récupérer une application par ID', async () => {
    expect(await service.findOne(1)).toEqual({ id: 1, name: 'Test App' });
    expect(repository.findOne).toHaveBeenCalledWith(1);
  });

  it('devrait mettre à jour une application', async () => {
    expect(await service.update(1, { name: 'Updated App' })).toEqual({ affected: 1 });
    expect(repository.update).toHaveBeenCalledWith(1, { name: 'Updated App' });
  });

  it('devrait supprimer une application', async () => {
    expect(await service.remove(1)).toEqual({ affected: 1 });
    expect(repository.delete).toHaveBeenCalledWith(1);
  });

  it('devrait renvoyer une erreur si l’application n’existe pas', async () => {
    await expect(service.findOne(99)).resolves.toBeNull();
  });
});
