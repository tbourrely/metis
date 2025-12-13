import { ResourceEntity } from '@modules/resource/domain/resource.entity';
import { ResourceType } from '@modules/resource/domain/resource.types';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ResourceModel {
  @PrimaryColumn()
  id: string;
  @Column()
  name: string;
  @Column({ type: 'enum', enum: ResourceType })
  type: ResourceType;
  @Column()
  sourceName: string;
  @Column()
  sourceUrl: string;
  @Column()
  createdAt: Date;
  @Column()
  updatedAt: Date;

  fromEntity(entity: ResourceEntity): ResourceModel {
    this.id = entity.id;
    this.name = entity.name;
    this.type = entity.type;
    this.sourceName = entity.source.name;
    this.sourceUrl = entity.source.url;
    this.createdAt = entity.createdAt;
    this.updatedAt = new Date();
    return this;
  }

  toEntity(): ResourceEntity {
    return ResourceEntity.create({
      name: this.name,
      type: this.type,
      source: {
        name: this.sourceName,
        url: this.sourceUrl,
      },
    });
  }
}
