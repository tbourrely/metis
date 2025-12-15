import { GetByIDDTO, ResourceDTO } from '@modules/resource/shared/dto';
import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { routesV1 } from 'src/configs/routing';
import { UpdateDTO } from './update.dto';
import { UpdateCommand } from './update.command';
import { match, Result } from 'oxide.ts';
import { ResourceEntity } from '@modules/resource/domain/resource.entity';
import { ResourceNotFoundError } from '@modules/resource/domain/resource.errors';
import { CommandBus } from '@nestjs/cqrs';

@Controller(routesV1.version)
@ApiTags(routesV1.tags.resources)
export class UpdateHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiResponse({
    status: 200,
    description: 'Resource updated successfully',
    type: ResourceDTO,
  })
  @Patch(routesV1.resources.update)
  async updateResource(
    @Param() params: GetByIDDTO,
    @Body() body: UpdateDTO,
  ): Promise<ResourceDTO> {
    const command = new UpdateCommand(
      params.id,
      body.type,
      body.name,
      body.source?.name,
      body.source?.url,
    );

    const updatedResource: Result<ResourceEntity, Error> =
      await this.commandBus.execute(command);

    return match(updatedResource, {
      Ok: (resource) => ResourceDTO.fromEntity(resource),
      Err: (error) => {
        if (error instanceof ResourceNotFoundError) {
          throw new BadRequestException(error.message);
        }

        throw new InternalServerErrorException(error.message);
      },
    });
  }
}
