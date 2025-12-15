import { ResourceType } from '@modules/resource/domain/resource.types';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class SourceDTO {
  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly name?: string;

  @ApiProperty()
  @IsUrl()
  @IsOptional()
  readonly url?: string;
}

export class UpdateDTO {
  @ApiProperty({ enum: ResourceType })
  @IsEnum(ResourceType)
  @IsOptional()
  readonly type?: ResourceType;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly name?: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => SourceDTO)
  @IsOptional()
  readonly source?: SourceDTO;
}
