import { Test } from '@nestjs/testing';
import {
  ReaderModeQuery,
  ReaderModeQueryHandler,
} from './readermode.query-handler';
import { RESOURCE_REPOSITORY } from '@modules/resource/di-tokens';
import { ResourceRepositoryPort } from '@modules/resource/database/resource.repository.port';
import { ResourceEntity } from '@modules/resource/domain/resource.entity';
import { ResourceType } from '@modules/resource/domain/resource.types';

describe('ReaderModeQueryHandler', () => {
  let handler: ReaderModeQueryHandler;
  let repository: ResourceRepositoryPort;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ReaderModeQueryHandler,
        {
          provide: RESOURCE_REPOSITORY,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = moduleRef.get<ReaderModeQueryHandler>(ReaderModeQueryHandler);
    repository = moduleRef.get<ResourceRepositoryPort>(RESOURCE_REPOSITORY);
  });

  it('should fetch reader mode content', async () => {
    jest.spyOn(repository, 'findById').mockResolvedValue(
      ResourceEntity.create({
        name: 'example-resource',
        type: ResourceType.TEXT,
        source: {
          url: 'https://martinfowler.com/bliki/Yagni.html',
          name: 'yagni',
        },
      }),
    );

    const result = await handler.execute(new ReaderModeQuery('example-id'));
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toContain(
      'Yagni originally is an acronym that stands for', // snippet from the article
    );
  });

  it('should return error if resource not found', async () => {
    jest.spyOn(repository, 'findById').mockResolvedValue(null);
    const result = await handler.execute(
      new ReaderModeQuery('non-existent-id'),
    );
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.unwrapErr().message).toBe(
        'Resource with name "non-existent-id" does not exist.',
      );
    }
  });

  it('should return error for non TEXT documents', async () => {
    jest.spyOn(repository, 'findById').mockResolvedValue(
      ResourceEntity.create({
        name: 'example-pdf-resource',
        type: ResourceType.DOCUMENT,
        source: {
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          name: 'dummy-pdf',
        },
      }),
    );
    const result = await handler.execute(new ReaderModeQuery('example-pdf-id'));

    expect(result.isErr()).toBe(true);
  });

  // TODO
  it.todo('should handle fetch errors');
  it.todo('should handle parse errors');

  // Test for a known problematic URL
  it('should parse a problematic URL correctly', async () => {
    jest.spyOn(repository, 'findById').mockResolvedValue(
      ResourceEntity.create({
        name: 'medium-article',
        type: ResourceType.TEXT,
        source: {
          url: 'https://jimmyhmiller.com/overly-humble-programmer',
          name: 'medium-article',
        },
      }),
    );

    const result = await handler.execute(
      new ReaderModeQuery('medium-article-id'),
    );
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).not.toBe('');
  });
});
