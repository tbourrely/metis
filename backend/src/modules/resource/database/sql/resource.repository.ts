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

  async findById(id: string): Promise<ResourceEntity | null> {
    const result = await this.repository.findOne({ where: { id } });
    if (!result) {
      return null;
    }
    return result.toEntity();
  }

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

  async findPaginated(
    offset: number,
    limit: number,
  ): Promise<{ items: ResourceEntity[]; total: number }> {
    const [models, total] = await this.repository.findAndCount({
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { items: models.map((m) => m.toEntity()), total };
  }

  async update(resource: ResourceEntity): Promise<ResourceEntity> {
    const model = ResourceModel.fromEntity(resource);
    const updatedResource = await this.repository.save(model);
    return updatedResource.toEntity();
  }
}
