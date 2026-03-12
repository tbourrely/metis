import { ResourceType } from '@modules/resource/domain/resource.types';
import { HighlightDTO } from '@modules/resource/shared/dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
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
  @IsOptional()
  readonly read?: boolean;

  @ApiProperty()
  @ValidateNested()
  @Type(() => SourceDTO)
  @IsOptional()
  readonly source?: SourceDTO;

  @ApiProperty({ type: [HighlightDTO] })
  @IsArray()
  @Type(() => HighlightDTO)
  @ValidateNested({ each: true })
  @IsOptional()
  readonly highlights?: HighlightDTO[];
}
