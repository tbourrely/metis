import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { routesV1 } from 'src/configs/routing';
import { ReaderModeQuery } from './readermode.query-handler';
import { Result, match } from 'oxide.ts';
import {
  ResourceNotFoundError,
  UnsupportedActionError,
} from '@modules/resource/domain/resource.errors';

@Controller(routesV1.version)
@ApiTags(routesV1.tags.resources)
export class ReaderModeHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiResponse({
    status: 200,
    description: 'Reader mode content, as it would be rendered in firefox',
    type: String,
  })
  @Get(routesV1.resources.readermode)
  async getReaderModeContent(@Param('id') id: string): Promise<string> {
    const query = new ReaderModeQuery(id);
    const result: Result<string, Error> = await this.queryBus.execute(query);
    return match(result, {
      Ok: (content) => content,
      Err: (error) => {
        if (error instanceof ResourceNotFoundError) {
          throw new BadRequestException(error.message);
        }

        if (error instanceof UnsupportedActionError) {
          throw new BadRequestException(error.message);
        }

        throw new InternalServerErrorException(error.message);
      },
    });
  }
}
