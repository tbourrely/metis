import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResourceDTO } from '@modules/resource/shared/dto';

class PaginationMetaDTO {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  perPage: number;

  @ApiProperty()
  totalPages: number;
}

export class PaginationQueryDTO {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  perPage?: number = 20;

  @ApiPropertyOptional({
    description: 'Filter by resource name / source name (like)',
  })
  @IsOptional()
  @Type(() => String)
  name?: string;

  @ApiPropertyOptional({
    description: 'Hide read resources',
    default: false,
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  hideRead?: boolean;
}

export class PaginatedResultDTO {
  @ApiProperty({ isArray: true, type: ResourceDTO })
  items: ResourceDTO[];

  @ApiProperty()
  meta: PaginationMetaDTO;
}
