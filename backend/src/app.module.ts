import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ResourceModule } from '@modules/resource/resource.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // TODO: Configure database connection properly
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'user',
      password: 'password',
      database: 'metis',
      entities: [__dirname + '/**/*.model.{js,ts}'],
      synchronize: true,
    }),
    CqrsModule.forRoot(),
    ResourceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
