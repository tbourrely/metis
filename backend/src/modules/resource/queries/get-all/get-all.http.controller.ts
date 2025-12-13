import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { routesV1 } from 'src/configs/routing';
import { GetAllQuery } from './get-all.query-handler';
import { ResponseDTO } from './get-all.response.dto';
import { ResourceEntity } from '@modules/resource/domain/resource.entity';

@Controller(routesV1.version)
@ApiTags(routesV1.tags.resources)
export class GetAllHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiResponse({
    status: 200,
    description: 'List of all resources',
    type: [ResponseDTO],
  })
  @Get(routesV1.resources.root)
  async getAllResources(): Promise<ResponseDTO[]> {
    const query = new GetAllQuery();
    const resources: ResourceEntity[] = await this.queryBus.execute(query);
    return resources.map((resource) => ResponseDTO.fromEntity(resource));
  }
}
