import type { ResourceRepositoryPort } from '@modules/resource/database/resource.repository.port';
import { Result, Err, Ok } from 'oxide.ts';
import { ResourceNotFoundError } from '@modules/resource/domain/resource.errors';
import { Inject } from '@nestjs/common';
import { RESOURCE_REPOSITORY } from '@modules/resource/di-tokens';
import { ResourceEntity } from '@modules/resource/domain/resource.entity';
import { CommandHandler } from '@nestjs/cqrs';
import { UpdateCommand } from './update.command';

@CommandHandler(UpdateCommand)
export class UpdateService {
  constructor(
    @Inject(RESOURCE_REPOSITORY)
    private readonly repository: ResourceRepositoryPort,
  ) {}

  async execute(
    command: UpdateCommand,
  ): Promise<Result<ResourceEntity, Error>> {
    const resource = await this.repository.findById(command.id);
    if (!resource) {
      return Err(new ResourceNotFoundError(command.id));
    }

    if (command.read !== undefined) {
      resource.read = command.read;
    }

    if (command.type !== undefined) {
      resource.type = command.type;
    }

    if (command.sourceName !== undefined) {
      resource.source.name = command.sourceName;
    }

    if (command.sourceUrl !== undefined) {
      resource.source.url = command.sourceUrl;
    }

    if (command.name !== undefined) {
      resource.name = command.name;
    }

    const updated = await this.repository.update(resource);
    return Ok(updated);
  }
}
