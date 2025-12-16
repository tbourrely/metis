import { Test, TestingModule } from '@nestjs/testing';
import { CreateService } from './create.service';
import {
  RESOURCE_GATEWAY,
  RESOURCE_REPOSITORY,
} from '@modules/resource/di-tokens';
import { ResourceRepositoryPort } from '@modules/resource/database/resource.repository.port';
import { CreateCommand } from './create.command';
import { ResourceType } from '@modules/resource/domain/resource.types';
import { ResourceEntity } from '@modules/resource/domain/resource.entity';
import { ResourceGateway } from '@modules/resource/gateways/resource.gateway';
import { Ok } from 'oxide.ts';

describe('ResourceCreateService', () => {
  let service: CreateService;
  let repository: ResourceRepositoryPort;
  let gateway: ResourceGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateService,
        {
          provide: RESOURCE_REPOSITORY,
          useValue: {
            findByName: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: RESOURCE_GATEWAY,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CreateService>(CreateService);
    repository = module.get<ResourceRepositoryPort>(RESOURCE_REPOSITORY);
    gateway = module.get<ResourceGateway>(RESOURCE_GATEWAY);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a resource successfully', async () => {
    jest.spyOn(repository, 'findByName').mockResolvedValue(null);
    jest.spyOn(repository, 'save').mockResolvedValue('resource-id-123');
    jest.spyOn(gateway, 'get').mockResolvedValue(
      Promise.resolve(
        Ok(
          new ResourceEntity({
            id: '',
            name: 'Sample Resource',
            type: ResourceType.TEXT,
            source: { name: 'Sample Source', url: 'http://example.com/data' },
            createdAt: new Date(),
            read: false,
          }),
        ),
      ),
    );

    const command = new CreateCommand('http://example.com/data');

    const result = await service.execute(command);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.unwrap()).toBe('resource-id-123');
    }
  });

  it('should return an error if resource already exists', async () => {
    const existingResource = new ResourceEntity({
      id: 'existing-id',
      name: 'Sample Resource',
      type: ResourceType.TEXT,
      source: { name: 'Sample Source', url: 'http://example.com/data' },
      createdAt: new Date(),
      read: false,
    });
    jest.spyOn(repository, 'findByName').mockResolvedValue(existingResource);
    jest
      .spyOn(gateway, 'get')
      .mockResolvedValue(Promise.resolve(Ok(existingResource)));

    const command = new CreateCommand('http://example.com/data');

    const result = await service.execute(command);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.unwrapErr().message).toBe(
        'Resource with name "Sample Resource" already exists.',
      );
    }
  });
});
