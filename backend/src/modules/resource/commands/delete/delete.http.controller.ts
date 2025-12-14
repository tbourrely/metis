import {
  BadRequestException,
  Controller,
  Delete,
  InternalServerErrorException,
  Param,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { match, Result } from 'oxide.ts';
import { DeleteCommand } from './delete.command';
import { ResourceNotFoundError } from '@modules/resource/domain/resource.errors';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { routesV1 } from 'src/configs/routing';
import { GetByIDDTO } from '@modules/resource/shared/dto';

@Controller(routesV1.version)
@ApiTags(routesV1.tags.resources)
export class DeleteHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @Delete(routesV1.resources.delete)
  @ApiResponse({
    status: 200,
    description: 'Resource deleted successfully',
    type: Boolean,
  })
  async deleteResource(@Param() params: GetByIDDTO): Promise<boolean> {
    const command = new DeleteCommand(params.id);

    const deletionResult: Result<boolean, Error> =
      await this.commandBus.execute(command);

    return match(deletionResult, {
      Ok: (deleted) => deleted,
      Err: (error) => {
        if (error instanceof ResourceNotFoundError) {
          throw new BadRequestException(error.message);
        }

        throw new InternalServerErrorException(error.message);
      },
    });
  }
}
