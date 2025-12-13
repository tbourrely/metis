import { ResourceRepositoryPort } from '@modules/resource/database/resource.repository.port';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ResourceModel } from './resource.model';
import { InjectRepository } from '@nestjs/typeorm';
import { ResourceEntity } from '@modules/resource/domain/resource.entity';

@Injectable()
export class SqlResourceRepository implements ResourceRepositoryPort {
  constructor(
    @InjectRepository(ResourceModel)
    private readonly repository: Repository<ResourceModel>,
  ) {}

  async findByName(name: string): Promise<ResourceEntity | null> {
    const result = await this.repository.findOne({ where: { name } });
    if (!result) {
      return null;
    }
    return result.toEntity();
  }

  async save(resource: ResourceEntity): Promise<string> {
    const model = ResourceModel.fromEntity(resource);
    const savedResource = await this.repository.save(model);
    return savedResource.id;
  }

  async delete(resource: ResourceEntity): Promise<boolean> {
    const result = await this.repository.delete(resource.id);
    if (!result) {
      return false;
    }
    return (result.affected || 0) > 0;
  }
}
