jest.mock(
  'src/configs/routing',
  () => ({
    routesV1: {
      version: 'v1',
      tags: { imports: 'Imports' },
      imports: { root: '/import' },
    },
  }),
  { virtual: true },
);

import { Test, TestingModule } from '@nestjs/testing';
import { ImportHttpController } from './import.http.controller';
import { CommandBus } from '@nestjs/cqrs';
import { Ok, Err } from 'oxide.ts';
import { ImportResourcesDTO } from './import.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { ImportCommand } from './import.command';

describe('ImportHttpController', () => {
  let controller: ImportHttpController;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImportHttpController],
      providers: [
        {
          provide: CommandBus,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<ImportHttpController>(ImportHttpController);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return created and errors when ImportService succeeds', async () => {
    const payload = {
      urls: ['http://a', 'http://b'],
    } as ImportResourcesDTO;
    const expected = { created: ['id-a', 'id-b'], errors: [] };
    (commandBus.execute as jest.Mock).mockResolvedValueOnce(Ok(expected));

    const res = await controller.import(payload);

    expect(res).toEqual(expected);
    const executeMock = jest.spyOn(commandBus, 'execute');
    expect(executeMock).toHaveBeenCalledWith(expect.any(ImportCommand));
  });

  it('should throw InternalServerErrorException when ImportService returns Err', async () => {
    const payload = { urls: ['http://a'] } as ImportResourcesDTO;
    (commandBus.execute as jest.Mock).mockResolvedValueOnce(
      Err(new Error('fail')),
    );

    await expect(controller.import(payload)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});
