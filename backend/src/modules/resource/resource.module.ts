import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RESOURCE_GATEWAY, RESOURCE_REPOSITORY } from './di-tokens';
import { SqlResourceRepository } from './database/sql/resource.repository';
import { CreateService } from './commands/create/create.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceModel } from './database/sql/resource.model';
import { CreateHttpController } from './commands/create/create.http.controller';
import { DeleteHttpController } from './commands/delete/delete.http.controller';
import { DeleteService } from './commands/delete/delete.service';
import { GetAllHttpController } from './queries/get-all/get-all.http.controller';
import { GetAllQueryHandler } from './queries/get-all/get-all.query-handler';
import { ReaderModeHttpController } from './queries/readermode/readermode.http.controller';
import { ReaderModeQueryHandler } from './queries/readermode/readermode.query-handler';
import { GetByIdHttpController } from './queries/get-by-id/get-by-id.http.controller';
import { GetByIdQueryHandler } from './queries/get-by-id/get-by-id.query-handler';
import { GetSourcesHttpController } from './queries/get-sources/get-sources.http.controller';
import { GetSourcesQueryHandler } from './queries/get-sources/get-sources.query-handler';
import { UpdateHttpController } from './commands/update/update.http.controller';
import { UpdateService } from './commands/update/update.service';
import { ResourceGateway } from './gateways/resource.gateway';
import { ImportHttpController } from './commands/import/import.http.controller';
import { ImportService } from './commands/import/import.service';
import { RefreshContentHttpController } from './commands/refresh-content/refresh-content.http.controller';
import { RefreshContentService } from './commands/refresh-content/refresh-content.service';

@Module({
  controllers: [
    CreateHttpController,
    DeleteHttpController,
    GetAllHttpController,
    ReaderModeHttpController,
    GetByIdHttpController,
    UpdateHttpController,
    ImportHttpController,
    RefreshContentHttpController,
    GetSourcesHttpController,
  ],
  imports: [CqrsModule, TypeOrmModule.forFeature([ResourceModel])],
  providers: [
    {
      provide: RESOURCE_REPOSITORY,
      useClass: SqlResourceRepository,
    },
    {
      provide: RESOURCE_GATEWAY,
      useClass: ResourceGateway,
    },
    CreateService,
    DeleteService,
    UpdateService,
    GetAllQueryHandler,
    ReaderModeQueryHandler,
    GetByIdQueryHandler,
    GetSourcesQueryHandler,
    ImportService,
    RefreshContentService,
  ],
})
export class ResourceModule {}
