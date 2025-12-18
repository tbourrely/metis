import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ResourceModule } from '@modules/resource/resource.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
      username: process.env.DB_USER || 'user',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'metis',
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
