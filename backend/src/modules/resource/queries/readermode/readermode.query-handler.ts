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
import puppeteer from 'puppeteer';

export class ReaderModeQuery {
  constructor(readonly resourceId: string) {}
}

@QueryHandler(ReaderModeQuery)
export class ReaderModeQueryHandler {
  constructor(
    @Inject(RESOURCE_REPOSITORY)
    private readonly repository: ResourceRepositoryPort,
  ) {}

  /**
   * Returns the content of a given resource as it would be rendered by firefox readermode.
   */
  async execute(query: ReaderModeQuery): Promise<Result<string, Error>> {
    const resource = await this.repository.findById(query.resourceId);
    if (!resource) {
      return Err(new ResourceNotFoundError(query.resourceId));
    }

    if (resource.type !== ResourceType.TEXT) {
      return Err(new UnsupportedActionError('readermode'));
    }

    const url = resource.source.url;

    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2' });
      const html = await page.content();
      await browser.close();
      const { window } = new JSDOM(html, { url });
      const article = new Readability(window.document).parse();
      return Ok(article?.content || '');
    } catch (error) {
      console.error('Error fetching page content', error);
      return Err(new Error('Failed to fetch page content'));
    }
  }
}
