import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { routesV1 } from 'src/configs/routing';
import { GetAllQuery } from './get-all.query-handler';
import { ResourceEntity } from '@modules/resource/domain/resource.entity';
import { ResourceDTO } from '@modules/resource/shared/dto';

@Controller(routesV1.version)
@ApiTags(routesV1.tags.resources)
export class GetAllHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiResponse({
    status: 200,
    description: 'List of all resources',
    type: [ResourceDTO],
  })
  @Get(routesV1.resources.root)
  async getAllResources(): Promise<ResourceDTO[]> {
    const query = new GetAllQuery();
    const resources: ResourceEntity[] = await this.queryBus.execute(query);
    return resources.map((resource) => ResourceDTO.fromEntity(resource));
  }
}
