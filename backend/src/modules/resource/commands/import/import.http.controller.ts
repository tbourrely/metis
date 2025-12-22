import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ImportCommand } from './import.command';
import { Result, match } from 'oxide.ts';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { routesV1 } from 'src/configs/routing';
import { ImportResourcesDTO } from './import.dto';

@Controller(routesV1.version)
@ApiTags(routesV1.tags.imports)
export class ImportHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({ summary: 'Import multiple resources by their URLs' })
  @ApiResponse({
    status: 201,
    description: 'Resources imported successfully',
    type: Object,
  })
  @Post(routesV1.imports.root)
  async import(
    @Body() body: ImportResourcesDTO,
  ): Promise<{ created: string[]; errors: { url: string; error: string }[] }> {
    const command = new ImportCommand(body.urls);
    const result: Result<
      { created: string[]; errors: { url: string; error: string }[] },
      Error
    > = await this.commandBus.execute(command);

    return match(result, {
      Ok: (data) => {
        const { created, errors } = data;
        if (created.length === 0 && errors.length > 0) {
          throw new InternalServerErrorException({ errors });
        }

        return data;
      },
      Err: (error) => {
        throw new InternalServerErrorException(error.message);
      },
    });
  }
}
