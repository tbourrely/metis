import { ResourceType } from '@modules/resource/domain/resource.types';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class SourceDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
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
  readonly source: SourceDTO;
}

export class ResponseDTO {
  @ApiProperty()
  @IsString()
  readonly id: string;

  @ApiProperty({ enum: ResourceType })
  @IsEnum(ResourceType)
  readonly type: ResourceType;

  @ApiProperty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @ValidateNested()
  readonly source: SourceDTO;

  @ApiProperty()
  @IsString()
  readonly createdAt: string;
}
