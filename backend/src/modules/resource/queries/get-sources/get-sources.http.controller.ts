import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { routesV1 } from 'src/configs/routing';
import { GetSourcesQuery } from './get-sources.query';
import { SourceDTO } from '@modules/resource/shared/dto';
import { Source } from '@modules/resource/domain/resource.types';

@Controller(routesV1.version)
@ApiTags(routesV1.tags.sources)
export class GetSourcesHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiResponse({
    status: 200,
    description: 'List of resource sources',
    type: [SourceDTO],
  })
  @Get(routesV1.sources.root)
  async getSources(): Promise<Source[]> {
    const raw = (await this.queryBus.execute(new GetSourcesQuery())) as unknown;
    if (!Array.isArray(raw)) return [];
    const items = raw as Source[];
    return items.map((it) => ({ name: it.name || '', url: it.url || '' }));
  }
}
