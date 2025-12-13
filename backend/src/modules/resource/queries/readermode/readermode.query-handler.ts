import type { ResourceRepositoryPort } from '@modules/resource/database/resource.repository.port';
import { RESOURCE_REPOSITORY } from '@modules/resource/di-tokens';
import {
  ResourceNotFoundError,
  UnsupportedActionError,
} from '@modules/resource/domain/resource.errors';
import { ResourceType } from '@modules/resource/domain/resource.types';
import { Readability } from '@mozilla/readability';
import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { JSDOM } from 'jsdom';
import { Result, Err, Ok } from 'oxide.ts';

export class ReaderModeQuery {
  constructor(readonly resourceName: string) {}
}

@QueryHandler(ReaderModeQuery)
export class ReaderModeQueryHandler {
  constructor(
    @Inject(RESOURCE_REPOSITORY)
    private readonly repository: ResourceRepositoryPort,
  ) {}

  async execute(query: ReaderModeQuery): Promise<Result<string, Error>> {
    const resource = await this.repository.findByName(query.resourceName);
    if (!resource) {
      return Err(new ResourceNotFoundError(query.resourceName));
    }

    if (resource.type !== ResourceType.TEXT) {
      return Err(new UnsupportedActionError('readermode'));
    }

    const url = resource.source.url;

    const content = await fetch(url);
    const text = await content.text();
    const { window } = new JSDOM(text, { url });
    const article = new Readability(window.document).parse();
    return Ok(article?.content || '');
  }
}
