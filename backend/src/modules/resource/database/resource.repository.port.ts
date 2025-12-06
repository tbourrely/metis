import { ResourceEntity } from '../domain/resource.entity';

export interface ResourceRepositoryPort {
  findByName(name: string): Promise<ResourceEntity | null>;
  findByType(type: string): Promise<ResourceEntity[]>;
  save(resource: ResourceEntity): Promise<void>;
  delete(resource: ResourceEntity): Promise<void>;
  findOneById(id: string): Promise<ResourceEntity | null>;
  findAll(): Promise<ResourceEntity[]>;
}
