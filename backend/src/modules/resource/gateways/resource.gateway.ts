import { Err, Ok, Result } from 'oxide.ts';
import { ResourceType } from '../domain/resource.types';
import { JSDOM } from 'jsdom';
import { ResourceEntity } from '../domain/resource.entity';
import { Injectable, Logger } from '@nestjs/common';

import { Readability } from '@mozilla/readability';

export type ResourceGetResult = {
  name: string;
  url: string;
  type: ResourceType;
};

export const defaultResourceName = 'Untitled Document';

@Injectable()
export class ResourceGateway {
  async get(url: string): Promise<Result<ResourceEntity, Error>> {
    try {
      const data = await fetch(url, {
        // Set headers to mimic a real browser request
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'en-US,en;q=0.5',
          Connection: 'keep-alive',
          Host: new URL(url).hostname,
          'Alt-Used': new URL(url).hostname,
          Referer: 'https://www.google.com/',
        },
      });
      if (!data.ok) {
        Logger.error(
          `Failed to fetch resource from ${url}: ${data.status} ${data.statusText}`,
        );
        return Err(new Error(`Failed to fetch resource from ${url}`));
      }

      const rawContent = await data.text();
      const content = this.cleanHtmlContent(rawContent);

      const type = this.extractTypeFromHeaders(data.headers);
      if (type === ResourceType.UNKNOWN) {
        return Err(new Error(`Unsupported resource type at ${url}`));
      }

      const name =
        type === ResourceType.DOCUMENT
          ? url.split('/').pop() // Use filename from URL for documents
          : this.extractNameFromMetadata(content, url); // Extract from HTML metadata for text

      const entity = ResourceEntity.create({
        name: name || defaultResourceName,
        type,
        source: {
          name: new URL(url).hostname,
          url,
        },
      });

      // For text resources, we can also estimate reading time
      // Documents like PDFs would require more complex parsing which is out of scope here for now
      // TODO: Implement PDF text extraction
      if (type === ResourceType.TEXT) {
        const estimatedReadingTime = this.extractEstimatedReadingTime(
          content,
          url,
        );
        entity.estimatedReadingTime = estimatedReadingTime;
      }

      return Ok(entity);
    } catch (error) {
      return Err(new Error(`Failed to fetch resource from ${url}: ${error}`));
    }
  }

  /**
   * Cleans HTML content by removing potentially problematic tags.
   *
   * @param content The raw HTML content.
   * @returns Cleaned HTML content.
   */
  cleanHtmlContent(content: string): string {
    return content
      .replace(/<script[\s\S]*?<\/script>/gi, '') // Remove script tags to avoid parsing issues
      .replace(/<style[\s\S]*?<\/style>/gi, ''); // Remove style tags to avoid parsing issues
  }

  /**
   * Estimates reading time in minutes based on word count.
   *
   * It relies on Mozilla's Readability library to extract the main content from HTML.
   *
   * @param content The HTML content of the resource.
   * @returns Estimated reading time in minutes.
   */
  extractEstimatedReadingTime(content: string, url: string): number {
    const wordsPerMinute = 238; // Average reading speed, source: https://scholarwithin.com/average-reading-speed#spelling-ebook

    const { window } = new JSDOM(content, { url }); // TODO: extract DOM only once for both name and reading time
    const article = new Readability(window.document).parse();
    if (!article?.textContent) {
      return 0;
    }

    const words = article?.textContent.split(/\s+/);
    const wordsCount = words.length;
    return Math.ceil(wordsCount / wordsPerMinute);
  }

  extractNameFromMetadata(content: string, url: string): string | null {
    const { window } = new JSDOM(content, {
      url,
    });
    const title = window.document.querySelector('head title');
    if (!title || !title.textContent) {
      return null;
    }
    return title.textContent.trim();
  }

  extractTypeFromHeaders(headers: Headers): ResourceType {
    const contentType = headers.get('content-type');
    if (!contentType) {
      return ResourceType.UNKNOWN;
    }

    if (
      contentType.includes('text/html') ||
      contentType.includes('text/plain')
    ) {
      return ResourceType.TEXT;
    }

    if (contentType.includes('application/pdf')) {
      return ResourceType.DOCUMENT;
    }

    return ResourceType.UNKNOWN;
  }
}
