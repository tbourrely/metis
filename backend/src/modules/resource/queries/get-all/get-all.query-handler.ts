import type { ResourceRepositoryPort } from '@modules/resource/database/resource.repository.port';
import { RESOURCE_REPOSITORY } from '@modules/resource/di-tokens';
import { ResourceEntity } from '@modules/resource/domain/resource.entity';
import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';

export class GetAllQuery {
  constructor(
    readonly page: number = 1,
    readonly perPage: number = 20,
    readonly name?: string,
  ) {}
}

@QueryHandler(GetAllQuery)
export class GetAllQueryHandler {
  constructor(
    @Inject(RESOURCE_REPOSITORY)
    private readonly repository: ResourceRepositoryPort,
  ) {}

  async execute(query: GetAllQuery): Promise<{
    items: ResourceEntity[];
    total: number;
    page: number;
    perPage: number;
  }> {
    const page = Math.max(1, Math.floor(query.page));
    const perPage = Math.max(1, Math.min(100, Math.floor(query.perPage)));
    const offset = (page - 1) * perPage;
    const { items, total } = await this.repository.findPaginated(
      offset,
      perPage,
      query.name,
    );
    return { items, total, page, perPage };
  }
}
