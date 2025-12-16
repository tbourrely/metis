import {
  Body,
  ConflictException,
  Controller,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCommand } from './create.command';
import { Result, match } from 'oxide.ts';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResourceAlreadyExistsError } from '@modules/resource/domain/resource.errors';
import { routesV1 } from 'src/configs/routing';
import { CreateResourceDTO } from './create.dto';

@Controller(routesV1.version)
@ApiTags(routesV1.tags.resources)
export class CreateHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiResponse({
    status: 201,
    description: 'Resource created successfully',
    type: String,
  })
  @Post(routesV1.resources.root)
  async create(@Body() body: CreateResourceDTO): Promise<string> {
    const command = new CreateCommand(body.url);
    const resourceId: Result<string, Error> =
      await this.commandBus.execute(command);

    return match(resourceId, {
      Ok: (id) => id,
      Err: (error) => {
        if (error instanceof ResourceAlreadyExistsError) {
          throw new ConflictException(error.message);
        }

        throw new InternalServerErrorException(error.message);
      },
    });
  }
}
