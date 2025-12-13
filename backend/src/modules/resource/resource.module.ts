import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RESOURCE_REPOSITORY } from './di-tokens';
import { SqlResourceRepository } from './database/sql/resource.repository';
import { CreateService } from './commands/create/create.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceModel } from './database/sql/resource.model';
import { CreateHttpController } from './commands/create/create.http.controller';

@Module({
  controllers: [CreateHttpController],
  imports: [CqrsModule, TypeOrmModule.forFeature([ResourceModel])],
  providers: [
    {
      provide: RESOURCE_REPOSITORY,
      useClass: SqlResourceRepository,
    },
    CreateService,
  ],
})
export class ResourceModule {}
