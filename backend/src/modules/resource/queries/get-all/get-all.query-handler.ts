import type { ResourceRepositoryPort } from '@modules/resource/database/resource.repository.port';
import { RESOURCE_REPOSITORY } from '@modules/resource/di-tokens';
import { ResourceEntity } from '@modules/resource/domain/resource.entity';
import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';

export class GetAllQuery {}

@QueryHandler(GetAllQuery)
export class GetAllQueryHandler {
  constructor(
    @Inject(RESOURCE_REPOSITORY)
    private readonly repository: ResourceRepositoryPort,
  ) {}

  async execute(): Promise<ResourceEntity[]> {
    return this.repository.find();
  }
}
