import { ResourceEntity } from '../domain/resource.entity';

export interface ResourceRepositoryPort {
  save(resource: ResourceEntity): Promise<string>;
  delete(resource: ResourceEntity): Promise<boolean>;
  findByName(name: string): Promise<ResourceEntity | null>;
  find(): Promise<ResourceEntity[]>;
}
