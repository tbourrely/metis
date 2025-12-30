import {
  Controller,
  InternalServerErrorException,
  Param,
  Post,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { routesV1 } from 'src/configs/routing';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetByIDDTO, ResourceDTO } from '@modules/resource/shared/dto';
import { RefreshContentCommand } from './refresh-content.command';
import { Result, match } from 'oxide.ts';
import { ResourceNotFoundError } from '@modules/resource/domain/resource.errors';
import { ResourceEntity } from '@modules/resource/domain/resource.entity';

@Controller(routesV1.version)
@ApiTags(routesV1.tags.resources)
export class RefreshContentHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiResponse({
    status: 200,
    description: 'Resource refreshed',
    type: ResourceDTO,
  })
  @Post(routesV1.resources.refreshContent)
  async refreshContent(@Param() params: GetByIDDTO): Promise<ResourceDTO> {
    const command = new RefreshContentCommand(params.id);
    const result: Result<ResourceEntity, Error> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (resource) => ResourceDTO.fromEntity(resource),
      Err: (error) => {
        if (error instanceof ResourceNotFoundError) {
          throw new InternalServerErrorException(error.message);
        }
        throw new InternalServerErrorException(error.message);
      },
    });
  }
}
