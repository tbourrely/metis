import type { ResourceRepositoryPort } from '@modules/resource/database/resource.repository.port';
import { CreateCommand } from './create.command';
import { ResourceEntity } from '@modules/resource/domain/resource.entity';
import { CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RESOURCE_REPOSITORY } from '@modules/resource/di-tokens';
import { Result, Err, Ok } from 'oxide.ts';
import { ResourceAlreadyExistsError } from '@modules/resource/domain/resource.errors';

@CommandHandler(CreateCommand)
export class CreateService {
  constructor(
    @Inject(RESOURCE_REPOSITORY)
    private readonly repository: ResourceRepositoryPort,
  ) {}

  async execute(command: CreateCommand): Promise<Result<string, Error>> {
    const resource = ResourceEntity.create({
      name: command.name,
      type: command.type,
      source: {
        name: command.sourceName,
        url: command.sourceUrl,
      },
    });

    const existingResource = await this.repository.findByName(command.name);
    if (existingResource) {
      return Err(new ResourceAlreadyExistsError(command.name));
    }

    const saveResult = await this.repository.save(resource);
    return Ok(saveResult);
  }
}
