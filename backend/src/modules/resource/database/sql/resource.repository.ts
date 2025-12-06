import z from 'zod';
import { ResourceEntity } from '@modules/resource/domain/resource.entity.js';
import { ResourceType } from '@modules/resource/domain/resource.types.js';
import { ResourceRepositoryPort } from '@modules/resource/database/resource.repository.port';
import { Injectable } from '@nestjs/common';
import type { DatabasePool } from 'slonik';
import { sql } from 'slonik';

export const ResourceSchema = z.object({
  id: z.uuidv7(),
  type: z.enum(ResourceType),
  name: z.string(),
  sourceName: z.string(),
  sourceUrl: z.url(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});

export type ResourceModel = z.infer<typeof ResourceSchema>;

export const toDomain = (model: ResourceModel): ResourceEntity => {
  return ResourceEntity.create({
    name: model.name,
    type: model.type,
    source: {
      name: model.sourceName,
      url: model.sourceUrl,
    },
  });
};

export const toModel = (entity: ResourceEntity): ResourceModel => {
  return {
    id: crypto.randomUUID(),
    type: entity.type,
    name: entity.name,
    sourceName: entity.source.name,
    sourceUrl: entity.source.url,
    createdAt: entity.createdAt,
    updatedAt: null,
  };
};

@Injectable()
export class SqlResourceRepository implements ResourceRepositoryPort {
  private pool: DatabasePool;

  constructor(pool: DatabasePool) {
    this.pool = pool;
  }

  async save(entity: ResourceEntity): Promise<string> {
    const resource = toModel(entity);
    await this.pool.query(sql.typeAlias('void')`
      INSERT INTO resources (id, type, name, source_name, source_url, created_at, updated_at)
      VALUES (${sql.uuid(resource.id)}, ${resource.type}, ${resource.name}, ${resource.sourceName}, ${resource.sourceUrl}, ${sql.date(resource.createdAt)}, ${resource.updatedAt ? sql.date(resource.updatedAt) : null})
      `);
    return resource.id;
  }

  async delete(entity: ResourceEntity): Promise<boolean> {
    const result = await this.pool.query(sql.typeAlias('number')`
      DELETE FROM resources WHERE name = ${entity.name}
      RETURNING 1
    `);
    return result.rowCount > 0;
  }

  async findByName(name: string): Promise<ResourceEntity | null> {
    const result = await this.pool.maybeOne(sql.type(ResourceSchema)` 
      SELECT id, type, name, source_name, source_url, created_at, updated_at
      FROM resources
      WHERE name = ${name}
    `);

    if (result === null) {
      return null;
    }

    const resourceModel = ResourceSchema.parse(result);
    return toDomain(resourceModel);
  }
}
