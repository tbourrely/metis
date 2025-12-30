import type { ResourceRepositoryPort } from '@modules/resource/database/resource.repository.port';
import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { RefreshContentCommand } from './refresh-content.command';
import { Result, Ok, Err } from 'oxide.ts';
import {
  RESOURCE_REPOSITORY,
  RESOURCE_GATEWAY,
} from '@modules/resource/di-tokens';
import { ResourceGateway } from '@modules/resource/gateways/resource.gateway';
import { ResourceNotFoundError } from '@modules/resource/domain/resource.errors';
import { ResourceEntity } from '@modules/resource/domain/resource.entity';

type FetchedResource = ResourceEntity & {
  content?: string;
  estimatedReadingTime?: number;
};

@CommandHandler(RefreshContentCommand)
export class RefreshContentService {
  constructor(
    @Inject(RESOURCE_REPOSITORY)
    private readonly repository: ResourceRepositoryPort,
    @Inject(RESOURCE_GATEWAY)
    private readonly gateway: ResourceGateway,
  ) {}

  async execute(
    command: RefreshContentCommand,
  ): Promise<Result<ResourceEntity, Error>> {
    const resource = await this.repository.findById(command.resourceId);
    if (!resource) return Err(new ResourceNotFoundError(command.resourceId));

    const fetchResult = await this.gateway.get(resource.source.url);
    if (fetchResult.isErr()) return Err(fetchResult.unwrapErr());

    const fetched = fetchResult.unwrap() as FetchedResource;

    // update fields that may have changed
    try {
      const stored = resource as FetchedResource;
      if (fetched.content !== undefined) stored.content = fetched.content;
      if (fetched.estimatedReadingTime !== undefined)
        stored.estimatedReadingTime = fetched.estimatedReadingTime;
      stored.name = fetched.name;
      stored.type = fetched.type;

      const updated = await this.repository.update(stored as ResourceEntity);
      return Ok(updated);
    } catch (err) {
      return Err(err as Error);
    }
  }
}
