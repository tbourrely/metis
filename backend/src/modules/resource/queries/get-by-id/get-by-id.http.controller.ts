import {
  Controller,
  Get,
  Param,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { routesV1 } from 'src/configs/routing';
import { GetByIdQuery } from './get-by-id.query-handler';
import { ResourceNotFoundError } from '@modules/resource/domain/resource.errors';
import { ResourceEntity } from '@modules/resource/domain/resource.entity';
import { match, Result } from 'oxide.ts';
import { GetByIDDTO, ResourceDTO } from '@modules/resource/shared/dto';

@Controller(routesV1.version)
@ApiTags(routesV1.tags.resources)
export class GetByIdHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiResponse({
    status: 200,
    description: 'Get resource by id',
    type: ResourceDTO,
  })
  @Get(routesV1.resources.read)
  async getResourceById(@Param() params: GetByIDDTO): Promise<ResourceDTO> {
    const query = new GetByIdQuery(params.id);
    const resource: Result<ResourceEntity, Error> =
      await this.queryBus.execute(query);
    return match(resource, {
      Ok: (res) => ResourceDTO.fromEntity(res),
      Err: (error) => {
        if (error instanceof ResourceNotFoundError) {
          throw new BadRequestException(error.message);
        }
        throw new InternalServerErrorException(error.message);
      },
    });
  }
}
