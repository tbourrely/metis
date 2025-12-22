import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUrl } from 'class-validator';

export class ImportResourcesDTO {
  @ApiProperty({ type: [String], description: 'List of URLs to import' })
  @IsArray()
  @IsUrl({}, { each: true })
  readonly urls: string[];
}
