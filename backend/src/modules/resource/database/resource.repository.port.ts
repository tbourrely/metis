import { ResourceEntity } from '../domain/resource.entity';

export interface ResourceRepositoryPort {
  save(resource: ResourceEntity): Promise<string>;
  delete(resource: ResourceEntity): Promise<boolean>;
  findById(id: string): Promise<ResourceEntity | null>;
  findByName(name: string): Promise<ResourceEntity | null>;
  findPaginated(
    offset: number,
    limit: number,
    nameFilter?: string,
    hideRead?: boolean,
  ): Promise<{ items: ResourceEntity[]; total: number }>;
  update(resource: ResourceEntity): Promise<ResourceEntity>;
}
