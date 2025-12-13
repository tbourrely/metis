import { ResourceType } from '@modules/resource/domain/resource.types';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class SourceDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUrl()
  readonly url: string;
}

export class RequestDTO {
  @ApiProperty({ enum: ResourceType })
  @IsEnum(ResourceType)
  readonly type: ResourceType;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => SourceDTO)
  readonly source: SourceDTO;
}
