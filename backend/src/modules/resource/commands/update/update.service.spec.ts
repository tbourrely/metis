import { ResourceRepositoryPort } from '@modules/resource/database/resource.repository.port';
import { UpdateService } from './update.service';
import { Test, TestingModule } from '@nestjs/testing';
import { RESOURCE_REPOSITORY } from '@modules/resource/di-tokens';
import { ResourceEntity } from '@modules/resource/domain/resource.entity';
import { ResourceType } from '@modules/resource/domain/resource.types';
import { UpdateCommand } from './update.command';
import { ResourceNotFoundError } from '@modules/resource/domain/resource.errors';

describe('ResourceUpdateService', () => {
  let service: UpdateService;
  let repository: ResourceRepositoryPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateService,
        {
          provide: RESOURCE_REPOSITORY,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UpdateService>(UpdateService);
    repository = module.get<ResourceRepositoryPort>(RESOURCE_REPOSITORY);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should update a resource successfully', async () => {
    const createdAt = new Date('2024-01-01T00:00:00Z');

    jest.spyOn(repository, 'findById').mockResolvedValue(
      new ResourceEntity({
        id: 'resource-id-123',
        name: 'Sample Resource',
        type: ResourceType.TEXT,
        source: { name: 'Sample Source', url: 'http://example.com/data' },
        createdAt,
      }),
    );
    jest.spyOn(repository, 'update').mockResolvedValue(
      new ResourceEntity({
        id: 'resource-id-123',
        name: 'Updated Resource', // only this field is updated
        type: ResourceType.TEXT,
        source: { name: 'Sample Source', url: 'http://example.com/data' },
        createdAt,
      }),
    );

    const command = new UpdateCommand(
      'resource-id-123',
      undefined,
      'Updated Resource',
    );

    const result = await service.execute(command);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const updatedResource = result.unwrap();
      expect(updatedResource.name).toBe('Updated Resource');
      expect(updatedResource.source.name).toBe('Sample Source'); // unchanged
    }
  });

  it('should return an error if resource not found', async () => {
    jest.spyOn(repository, 'findById').mockResolvedValue(null);

    const command = new UpdateCommand('non-existent-id');

    const result = await service.execute(command);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.unwrapErr()).toBeInstanceOf(ResourceNotFoundError);
    }
  });
});
