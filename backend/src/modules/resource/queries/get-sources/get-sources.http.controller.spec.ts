jest.mock(
  'src/configs/routing',
  () => ({
    routesV1: {
      version: 'v1',
      tags: { resources: 'Resources' },
      sources: { root: '/sources' },
    },
  }),
  { virtual: true },
);

import { Test, TestingModule } from '@nestjs/testing';
import { GetSourcesHttpController } from './get-sources.http.controller';
import { QueryBus } from '@nestjs/cqrs';

describe('GetSourcesHttpController', () => {
  let controller: GetSourcesHttpController;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetSourcesHttpController],
      providers: [
        {
          provide: QueryBus,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<GetSourcesHttpController>(GetSourcesHttpController);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return list of sources when query succeeds', async () => {
    const sources = [
      { name: 'site A', url: 'https://a.example' },
      { name: 'site B', url: 'https://b.example' },
    ];
    (queryBus.execute as jest.Mock).mockResolvedValueOnce(sources);

    const res = await controller.getSources();
    expect(res).toEqual(sources);
    const execMock = jest.spyOn(queryBus, 'execute') as unknown as jest.Mock;
    expect(execMock).toHaveBeenCalledWith(expect.any(Object));
  });

  it('should return empty list when handler returns unexpected value', async () => {
    (queryBus.execute as jest.Mock).mockResolvedValueOnce(null);
    const res = await controller.getSources();
    expect(res).toEqual([]);
  });
});
