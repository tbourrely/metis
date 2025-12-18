import { ResourceEntity } from '@modules/resource/domain/resource.entity';
import { ResourceType } from '@modules/resource/domain/resource.types';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ResourceModel {
  @PrimaryColumn()
  id: string;
  @Column({ unique: true })
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
  @Column({ default: false })
  read: boolean;
  @Column({ nullable: true })
  estimatedReadingTime?: number;

  static fromEntity(entity: ResourceEntity): ResourceModel {
    const model = new ResourceModel();
    model.id = entity.id;
    model.name = entity.name;
    model.type = entity.type;
    model.sourceName = entity.source.name;
    model.sourceUrl = entity.source.url;
    model.createdAt = entity.createdAt;
    model.updatedAt = new Date();
    model.read = entity.read;
    model.estimatedReadingTime = entity.estimatedReadingTime;
    return model;
  }

  toEntity(): ResourceEntity {
    return new ResourceEntity({
      id: this.id,
      name: this.name,
      type: this.type,
      source: {
        name: this.sourceName,
        url: this.sourceUrl,
      },
      createdAt: this.createdAt,
      read: this.read,
      estimatedReadingTime: this.estimatedReadingTime,
    });
  }
}
