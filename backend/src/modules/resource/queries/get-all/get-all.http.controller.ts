import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { routesV1 } from 'src/configs/routing';
import { GetAllQuery } from './get-all.query-handler';
import { ResourceEntity } from '@modules/resource/domain/resource.entity';
import { ResourceDTO } from '@modules/resource/shared/dto';
import { PaginationQueryDTO, PaginatedResultDTO } from './get-all.query.dto';

@Controller(routesV1.version)
@ApiTags(routesV1.tags.resources)
export class GetAllHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiResponse({
    status: 200,
    description: 'List of all resources (paginated)',
    type: PaginatedResultDTO,
  })
  @Get(routesV1.resources.root)
  async getAllResources(
    @Query() pagination: PaginationQueryDTO,
  ): Promise<PaginatedResultDTO> {
    const p = pagination?.page ?? 1;
    const pp = pagination?.perPage ?? 20;
    const query = new GetAllQuery(p, pp);
    const result: {
      items: ResourceEntity[];
      total: number;
      page: number;
      perPage: number;
    } = await this.queryBus.execute(query);
    const items = result.items.map((resource) =>
      ResourceDTO.fromEntity(resource),
    );
    const totalPages = Math.ceil(result.total / result.perPage) || 1;
    return {
      items,
      meta: {
        total: result.total,
        page: result.page,
        perPage: result.perPage,
        totalPages,
      },
    };
  }
}
