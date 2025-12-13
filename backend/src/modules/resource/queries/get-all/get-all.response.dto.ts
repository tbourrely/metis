import { ResourceEntity } from '@modules/resource/domain/resource.entity';
import { ResourceType } from '@modules/resource/domain/resource.types';
import { ApiProperty } from '@nestjs/swagger';

export class SourceDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  url: string;
}

export class ResponseDTO {
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

  static fromEntity(entity: ResourceEntity): ResponseDTO {
    const dto = new ResponseDTO();
    dto.id = entity.id;
    dto.type = entity.type;
    dto.name = entity.name;
    dto.source = {
      name: entity.source.name,
      url: entity.source.url,
    };
    dto.createdAt = entity.createdAt.toISOString();
    return dto;
  }
}
