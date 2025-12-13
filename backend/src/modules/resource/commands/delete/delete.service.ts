import type { ResourceRepositoryPort } from '@modules/resource/database/resource.repository.port';
import { DeleteCommand } from './delete.command';
import { Result, Err, Ok } from 'oxide.ts';
import { ResourceNotFoundError } from '@modules/resource/domain/resource.errors';
import { CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RESOURCE_REPOSITORY } from '@modules/resource/di-tokens';

@CommandHandler(DeleteCommand)
export class DeleteService {
  constructor(
    @Inject(RESOURCE_REPOSITORY)
    private readonly repository: ResourceRepositoryPort,
  ) {}

  async execute(command: DeleteCommand): Promise<Result<boolean, Error>> {
    const resource = await this.repository.findByName(command.name);
    if (!resource) {
      return Err(new ResourceNotFoundError(command.name));
    }

    return Ok(await this.repository.delete(resource));
  }
}
