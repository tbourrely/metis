import type { ResourceRepositoryPort } from '@modules/resource/database/resource.repository.port';
import { RESOURCE_REPOSITORY } from '@modules/resource/di-tokens';
import {
  ResourceNotFoundError,
  UnsupportedActionError,
} from '@modules/resource/domain/resource.errors';
import { ResourceType } from '@modules/resource/domain/resource.types';
import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { Result, Err, Ok } from 'oxide.ts';

export class ReaderModeQuery {
  constructor(readonly resourceId: string) {}
}

@QueryHandler(ReaderModeQuery)
export class ReaderModeQueryHandler {
  constructor(
    @Inject(RESOURCE_REPOSITORY)
    private readonly repository: ResourceRepositoryPort,
  ) {}

  /**
   * Returns the content of a given resource as it would be rendered by firefox readermode.
   */
  async execute(query: ReaderModeQuery): Promise<Result<string, Error>> {
    const resource = await this.repository.findById(query.resourceId);
    if (!resource) {
      return Err(new ResourceNotFoundError(query.resourceId));
    }

    if (resource.type !== ResourceType.TEXT) {
      return Err(new UnsupportedActionError('readermode'));
    }

    // Prefer stored content from the database to generate reader-mode view
    if (!resource.content) {
      return Err(
        new Error(
          `No stored content available for resource ${query.resourceId}`,
        ),
      );
    }

    // Content is already stored and ready to be served; return it directly
    return Ok(resource.content);
  }
}
