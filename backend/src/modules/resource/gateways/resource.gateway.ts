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
        headers: {
          // set a user-agent to avoid being blocked by some websites
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        },
      });
      if (!data.ok) {
        Logger.error(
          `Failed to fetch resource from ${url}: ${data.status} ${data.statusText}`,
        );
        return Err(new Error(`Failed to fetch resource from ${url}`));
      }

      const content = await data.text();

      const type = this.extractTypeFromHeaders(data.headers);
      if (type === ResourceType.UNKNOWN) {
        return Err(new Error(`Unsupported resource type at ${url}`));
      }

      const name =
        type === ResourceType.DOCUMENT
          ? url.split('/').pop() // Use filename from URL for documents
          : this.extractNameFromMetadata(content); // Extract from HTML metadata for text

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
        const estimatedReadingTime = this.extractEstimatedReadingTime(content);
        entity.estimatedReadingTime = estimatedReadingTime;
      }

      return Ok(entity);
    } catch (error) {
      return Err(new Error(`Failed to fetch resource from ${url}: ${error}`));
    }
  }

  /**
   * Estimates reading time in minutes based on word count.
   *
   * It relies on Mozilla's Readability library to extract the main content from HTML.
   *
   * @param content The HTML content of the resource.
   * @returns Estimated reading time in minutes.
   */
  extractEstimatedReadingTime(content: string): number {
    const wordsPerMinute = 238; // Average reading speed, source: https://scholarwithin.com/average-reading-speed#spelling-ebook
    const { window } = new JSDOM(content); // TODO: extract DOM only once for both name and reading time
    const article = new Readability(window.document).parse();
    if (!article?.textContent) {
      return 0;
    }

    const words = article?.textContent.split(/\s+/);
    const wordsCount = words.length;
    return Math.ceil(wordsCount / wordsPerMinute);
  }

  extractNameFromMetadata(content: string): string | null {
    const dom = new JSDOM(content);
    const title = dom.window.document.querySelector('head title');
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
