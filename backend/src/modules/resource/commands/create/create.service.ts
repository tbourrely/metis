import type { ResourceRepositoryPort } from '@modules/resource/database/resource.repository.port';
import { CreateCommand } from './create.command';
import { ResourceEntity } from '@modules/resource/domain/resource.entity';
import { CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  RESOURCE_GATEWAY,
  RESOURCE_REPOSITORY,
} from '@modules/resource/di-tokens';
import { Result, Err, Ok } from 'oxide.ts';
import { ResourceAlreadyExistsError } from '@modules/resource/domain/resource.errors';
import { ResourceGateway } from '@modules/resource/gateways/resource.gateway';

@CommandHandler(CreateCommand)
export class CreateService {
  constructor(
    @Inject(RESOURCE_REPOSITORY)
    private readonly repository: ResourceRepositoryPort,
    @Inject(RESOURCE_GATEWAY)
    private readonly gateway: ResourceGateway,
  ) {}

  async execute(command: CreateCommand): Promise<Result<string, Error>> {
    const resourceInformation: Result<ResourceEntity, Error> =
      await this.gateway.get(command.sourceUrl);
    if (resourceInformation.isErr()) {
      return Err(resourceInformation.unwrapErr());
    }

    const resource = resourceInformation.unwrap();

    const existingResource = await this.repository.findByName(resource.name);
    if (existingResource) {
      return Err(new ResourceAlreadyExistsError(resource.name));
    }

    const saveResult = await this.repository.save(resource);
    return Ok(saveResult);
  }
}
