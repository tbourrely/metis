import { ResourceRepositoryPort } from '@modules/resource/database/resource.repository.port';
import { DeleteService } from './delete.service';
import { Test, TestingModule } from '@nestjs/testing';
import { RESOURCE_REPOSITORY } from '@modules/resource/di-tokens';
import { DeleteCommand } from './delete.command';
import { ResourceEntity } from '@modules/resource/domain/resource.entity';
import { ResourceType } from '@modules/resource/domain/resource.types';
import { ResourceNotFoundError } from '@modules/resource/domain/resource.errors';

describe('ResourceDeleteService', () => {
  let service: DeleteService;
  let repository: ResourceRepositoryPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteService,
        {
          provide: RESOURCE_REPOSITORY,
          useValue: {
            findByName: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DeleteService>(DeleteService);
    repository = module.get<ResourceRepositoryPort>(RESOURCE_REPOSITORY);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delete a resource successfully', async () => {
    jest.spyOn(repository, 'findByName').mockResolvedValue(
      new ResourceEntity({
        id: 'resource-id-123',
        name: 'Sample Resource',
        type: ResourceType.PAPER,
        source: { name: 'Sample Source', url: 'http://example.com/data' },
        createdAt: new Date(),
      }),
    );
    jest.spyOn(repository, 'delete').mockResolvedValue(true);

    const command = new DeleteCommand('resource-id-123');

    const result = await service.execute(command);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.unwrap()).toBe(true);
    }
  });

  it('should return an error if resource not found', async () => {
    jest.spyOn(repository, 'findByName').mockResolvedValue(null);

    const command = new DeleteCommand('non-existent-id');

    const result = await service.execute(command);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.unwrapErr()).toBeInstanceOf(ResourceNotFoundError);
    }
  });
});
