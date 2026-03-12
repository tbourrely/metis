import { IsNotEmpty, IsUUID, IsInt } from 'class-validator';
import { ResourceEntity } from '@modules/resource/domain/resource.entity';
import {
  Highlight,
  ResourceType,
} from '@modules/resource/domain/resource.types';
import { ApiProperty } from '@nestjs/swagger';

export class GetByIDDTO {
  @ApiProperty({ type: String, format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  readonly id: string;
}

export class SourceDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  url: string;
}

// DTO for highlights
// both input and output
export class HighlightDTO {
  @ApiProperty()
  @IsInt()
  readonly start: number;

  @ApiProperty()
  @IsInt()
  readonly end: number;
}

export class ResourceDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ResourceType })
  type: ResourceType;

  @ApiProperty()
  source: SourceDTO;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  read: boolean;

  @ApiProperty()
  estimatedReadingTime?: number;

  @ApiProperty({ type: HighlightDTO, isArray: true })
  highlights: HighlightDTO[];

  static fromEntity(entity: ResourceEntity): ResourceDTO {
    const dto = new ResourceDTO();
    dto.id = entity.id;
    dto.type = entity.type;
    dto.name = entity.name;
    dto.source = {
      name: entity.source.name,
      url: entity.source.url,
    };
    dto.createdAt = entity.createdAt.toISOString();
    dto.read = entity.read;
    dto.estimatedReadingTime = entity.estimatedReadingTime;
    dto.highlights = entity.highlights;
    return dto;
  }
}
