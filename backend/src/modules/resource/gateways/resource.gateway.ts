import { Err, Ok, Result } from 'oxide.ts';
import { ResourceType } from '../domain/resource.types';
import { JSDOM } from 'jsdom';
import { ResourceEntity } from '../domain/resource.entity';
import { Injectable, Logger } from '@nestjs/common';

import { Readability } from '@mozilla/readability';
import puppeteer from 'puppeteer';

export type ResourceGetResult = {
  name: string;
  url: string;
  type: ResourceType;
};

export const defaultResourceName = 'Untitled Document';

type FetchResult = {
  headers: Record<string, string>;
  content: string;
  status: number;
};

@Injectable()
export class ResourceGateway {
  /**
   * Fetches a resource from the given URL using standard fetch API.
   *
   * @param url The URL of the resource to fetch.
   * @returns A Result containing FetchResult on success or an Error on failure.
   */
  private async fetch(url: string): Promise<Result<FetchResult, Error>> {
    try {
      const result = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
          'Accept-Language': 'en-US,en;q=0.9',
          'Content-Type': 'text/html',
        },
      });
      if (!result.ok) {
        return Err(
          new Error(`Failed to fetch resource from ${url}`, {
            cause: result.statusText,
          }),
        );
      }
      const headers: Record<string, string> = {};
      result.headers.forEach((value, key) => {
        headers[key.toLowerCase()] = value;
      });
      const content = await result.text();
      const status = result.status;
      return Ok({ headers, content, status });
    } catch (error) {
      return Err(new Error(`Fetch failed for ${url}: ${error}`));
    }
  }

  /**
   * Fetches a resource from the given URL using Puppeteer.
   *
   * @param url The URL of the resource to fetch.
   * @returns A Result containing FetchResult on success or an Error on failure.
   */
  private async fetchWithPuppeteer(
    url: string,
  ): Promise<Result<FetchResult, Error>> {
    const browser = await puppeteer.launch({ headless: true });
    try {
      const page = await browser.newPage();
      const response = await page.goto(url, { waitUntil: 'networkidle2' });
      if (!response) {
        throw new Error('No response received');
      }

      const headers = response.headers();
      const html = await page.content();
      const status = response.status();
      await browser.close();

      return Ok({ headers, content: html, status });
    } catch (error) {
      return Err(new Error(`Failed to fetch resource from ${url}: ${error}`));
    } finally {
      await browser.close();
    }
  }

  /**
   * Fetches and processes a resource from the given URL.
   *
   * @param url The URL of the resource to fetch.
   * @returns A Result containing ResourceEntity on success or an Error on failure.
   */
  async get(url: string): Promise<Result<ResourceEntity, Error>> {
    let contentFetchResult: FetchResult | null = null;

    const fetchResult = await this.fetch(url);
    if (fetchResult.isErr() || fetchResult.unwrap().status >= 400) {
      // Fallback to Puppeteer if standard fetch fails
      // this could be due to JS-rendered content or anti-bot measures
      const puppeteerResult = await this.fetchWithPuppeteer(url);
      if (puppeteerResult.isErr()) {
        return Err(
          new Error(
            `Failed to fetch resource from ${url} using both fetch and Puppeteer.`,
          ),
        );
      }

      contentFetchResult = puppeteerResult.unwrap();
    } else {
      contentFetchResult = fetchResult.unwrap();
    }

    const { headers, content: html } = contentFetchResult;

    const content = this.cleanHtmlContent(html);

    const type = this.extractTypeFromHeaders(headers);
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

    if (type !== ResourceType.TEXT) {
      return Ok(entity);
    }

    // For text resources, we can also estimate reading time
    // Documents like PDFs would require more complex parsing which is out of scope here for now
    //---
    // TODO: Implement PDF text extraction
    const estimatedReadingTimeResult = this.estimatedReadingTime(content, url);
    let estimed: number;

    if (estimatedReadingTimeResult.isErr()) {
      Logger.warn(
        `Failed to estimate reading time for resource at ${url}: ${estimatedReadingTimeResult.unwrapErr().message} - proceeding with puppeteer fallback.`,
      );

      const fallback = await this.fetchWithPuppeteer(url);
      if (fallback.isErr()) {
        Logger.warn(
          `Failed to estimate to fetch resource with fallback at ${url}: ${fallback.unwrapErr().message}`,
        );
        return Ok(entity); // return entity without reading time, better than failing entirely
      }

      const fallbackContent = this.cleanHtmlContent(fallback.unwrap().content);
      const fallbackEstimed = this.estimatedReadingTime(fallbackContent, url);
      if (fallbackEstimed.isErr()) {
        Logger.warn(
          `Could not estimate reading time for resource at ${url} even after fallback: ${fallbackEstimed.unwrapErr().message}`,
        );
        return Ok(entity); // same here, return without reading time
      }

      estimed = fallbackEstimed.unwrapOr(0);
    } else {
      estimed = estimatedReadingTimeResult.unwrap();
    }

    entity.estimatedReadingTime = estimed;
    return Ok(entity);
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
  estimatedReadingTime(content: string, url: string): Result<number, Error> {
    const wordsPerMinute = 238; // Average reading speed, source: https://scholarwithin.com/average-reading-speed#spelling-ebook

    const { window } = new JSDOM(content, { url }); // TODO: extract DOM only once for both name and reading time
    const article = new Readability(window.document).parse();
    if (!article?.textContent) {
      return Err(
        new Error('Failed to parse article content for reading time.'),
      );
    }

    const words = article?.textContent.split(/\s+/);
    const wordsCount = words.length;
    return Ok(Math.ceil(wordsCount / wordsPerMinute));
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

  extractTypeFromHeaders(headers: Record<string, string>): ResourceType {
    const contentType = headers['content-type'];
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
