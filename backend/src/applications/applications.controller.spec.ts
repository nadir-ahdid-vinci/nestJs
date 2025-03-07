import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';

const mockApplicationsService = {
  create: jest.fn((dto, req) => Promise.resolve({ id: 1, ...dto, ownerId: req.user.id })),
  findAll: jest.fn(() => Promise.resolve([{ id: 1, name: 'Test App', description: 'A test', status: 'active', ownerId: 1 }])),
  findOne: jest.fn(id => Promise.resolve(id === 1 ? { id: 1, name: 'Test App', description: 'A test', status: 'active', ownerId: 1 } : null)),
  update: jest.fn((id, dto, req) => Promise.resolve({ id, ...dto, ownerId: req.user.id })),
};

describe('ApplicationsController', () => {
  let controller: ApplicationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [
        {
          provide: ApplicationsService,
          useValue: mockApplicationsService,
        },
      ],
    }).compile();

    controller = module.get<ApplicationsController>(ApplicationsController);
  });

  it('devrait être défini', () => {
    expect(controller).toBeDefined();
  });

  it('devrait créer une application', async () => {
    const dto: CreateApplicationDto = { 
      name: 'New App', 
      description: 'A new test app', 
      status: 'active', 
      ownerId: 1 
    };
    const req = { user: { id: 1 } }; // Simuler un utilisateur connecté

    expect(await controller.create(dto, req)).toEqual({ id: 1, ...dto });
    expect(mockApplicationsService.create).toHaveBeenCalledWith(dto, req);
  });

  it('devrait récupérer toutes les applications', async () => {
    expect(await controller.findAll()).toEqual([{ id: 1, name: 'Test App', description: 'A test', status: 'active', ownerId: 1 }]);
    expect(mockApplicationsService.findAll).toHaveBeenCalled();
  });

  it('devrait récupérer une application par ID', async () => {
    expect(await controller.findOne(1)).toEqual({ id: 1, name: 'Test App', description: 'A test', status: 'active', ownerId: 1 });
    expect(mockApplicationsService.findOne).toHaveBeenCalledWith(1);
  });

  it('devrait mettre à jour une application', async () => {
    const updateDto = { name: 'Updated App', description: 'Updated description', status: 'inactive' };
    const req = { user: { id: 1 } };

    expect(await controller.update(1, updateDto, req)).toEqual({ id: 1, ...updateDto, ownerId: req.user.id });
    expect(mockApplicationsService.update).toHaveBeenCalledWith(1, updateDto, req);
  });
});
