import type { ResourceRepositoryPort } from '@modules/resource/database/resource.repository.port';
import { RESOURCE_REPOSITORY } from '@modules/resource/di-tokens';
import { ResourceEntity } from '@modules/resource/domain/resource.entity';
import { ResourceNotFoundError } from '@modules/resource/domain/resource.errors';
import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';

export class GetByIdQuery {
  constructor(readonly id: string) {}
}

@QueryHandler(GetByIdQuery)
export class GetByIdQueryHandler {
  constructor(
    @Inject(RESOURCE_REPOSITORY)
    private readonly repository: ResourceRepositoryPort,
  ) {}

  async execute(query: GetByIdQuery): Promise<Result<ResourceEntity, Error>> {
    const resource = await this.repository.findById(query.id);
    if (!resource) {
      return Err(new ResourceNotFoundError(query.id));
    }

    return Ok(resource);
  }
}
