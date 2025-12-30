import type { ResourceRepositoryPort } from '@modules/resource/database/resource.repository.port';
import { RESOURCE_REPOSITORY } from '@modules/resource/di-tokens';
import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { GetSourcesQuery } from './get-sources.query';
import { ResourceEntity } from '@modules/resource/domain/resource.entity';
import { Source } from '@modules/resource/domain/resource.types';

@QueryHandler(GetSourcesQuery)
export class GetSourcesQueryHandler {
  constructor(
    @Inject(RESOURCE_REPOSITORY)
    private readonly repository: ResourceRepositoryPort,
  ) {}

  async execute(_query: GetSourcesQuery): Promise<Source[]> {
    void _query;
    const perPage = 100;
    let offset = 0;
    let fetched = 0;
    const sources = new Map<string, string>(); // use a map to avoid duplicates

    const handle = (_r: ResourceEntity) => {
      if (!sources.has(_r.source.url)) {
        sources.set(_r.source.name, this.extractUrl(_r.source.url));
      }
    };

    const first = await this.repository.findPaginated(offset, perPage);
    first.items.forEach(handle);
    fetched += first.items.length;

    const total = first.total;
    offset += perPage;

    while (fetched < total) {
      const page = await this.repository.findPaginated(offset, perPage);
      page.items.forEach(handle);
      offset += perPage;
      fetched += page.items.length;
    }

    return Array.from(sources.entries()).map(([name, url]) => ({ name, url }));
  }

  private extractUrl(urlString: string): string {
    try {
      const url = new URL(urlString);
      return url.origin;
    } catch {
      return urlString;
    }
  }
}
