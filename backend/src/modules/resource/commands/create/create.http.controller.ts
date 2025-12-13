import {
  Body,
  ConflictException,
  Controller,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RequestDTO } from './create.dto';
import { CreateCommand } from './create.command';
import { Result, match } from 'oxide.ts';
import { ApiResponse } from '@nestjs/swagger';
import { ResourceAlreadyExistsError } from '@modules/resource/domain/resource.errors';

@Controller('/resource')
export class CreateHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiResponse({
    status: 201,
    description: 'Resource created successfully',
    type: String,
  })
  @Post()
  async create(@Body() body: RequestDTO): Promise<string> {
    const command = new CreateCommand(
      body.type,
      body.name,
      body.source.name,
      body.source.url,
    );
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
