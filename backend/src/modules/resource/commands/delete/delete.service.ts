import { ResourceRepositoryPort } from '@modules/resource/database/resource.repository.port';
import { DeleteCommand } from './delete.command';

export class DeleteService {
  constructor(private readonly repository: ResourceRepositoryPort) {}

  async execute(command: DeleteCommand) {
    const resource = await this.repository.findByName(command.name);
    if (!resource) {
      throw new Error(`Resource with name ${command.name} does not exist.`);
    }

    return this.repository.delete(resource);
  }
}
