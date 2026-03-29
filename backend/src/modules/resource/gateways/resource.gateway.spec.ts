import { ResourceType } from '../domain/resource.types';
import { ResourceGateway } from './resource.gateway';
const mockGetInfo = jest.fn();

// Mock pdf-parse so unit tests in describe('extractTitleFromPdf') can control
// getInfo() behaviour via mockGetInfo.
// Note: pdf-parse's real implementation relies on PDF.js workers which require
// --experimental-vm-modules and cannot run inside Jest. Integration tests that
// need title extraction should spy on extractTitleFromPdf directly instead.
jest.mock('pdf-parse', () => ({
  PDFParse: jest.fn().mockImplementation(() => ({ getInfo: mockGetInfo })),
}));

describe('ResourceGateway', () => {
  // jest.retryTimes(2); // Retry tests up to 2 times in case of transient network issues

  it.each([
    {
      url: 'https://martinfowler.com/bliki/Yagni.html',
      expectedName: 'Yagni',
      expectedType: ResourceType.TEXT,
      expectedSourceName: 'martinfowler.com',
      expectedReadingTime: 9,
    },
    {
      url: 'https://www.dddcommunity.org/wp-content/uploads/files/pdf_articles/Vernon_2011_1.pdf',
      expectedName: 'Vernon_2011_1.pdf',
      expectedType: ResourceType.DOCUMENT,
      expectedSourceName: 'www.dddcommunity.org',
    },
    {
      url: 'https://obie.medium.com/what-happens-when-the-coding-becomes-the-least-interesting-part-of-the-work-ab10c213c660',
      expectedName:
        'What happens when the coding becomes the least interesting part of the work | by Obie Fernandez | Medium',
      expectedType: ResourceType.TEXT,
      expectedSourceName: 'obie.medium.com',
      expectedReadingTime: 8,
    },
  ])(
    'should fetch $url and extract correct metadata',
    async ({
      url,
      expectedName,
      expectedType,
      expectedSourceName,
      expectedReadingTime,
    }) => {
      const gw = new ResourceGateway();

      const resourceDetails = await gw.get(url);

      expect(resourceDetails.isOk()).toBe(true);
      const content = resourceDetails.unwrap();
      expect(content.source.url).toBe(url);
      expect(content.source.name).toBe(expectedSourceName);
      expect(content.name).toBe(expectedName);
      expect(content.type).toBe(expectedType);
      if (expectedReadingTime) {
        expect(content.estimatedReadingTime).not.toBeUndefined();
        expect(content.estimatedReadingTime).toBeGreaterThanOrEqual(
          expectedReadingTime - 2,
        );
        expect(content.estimatedReadingTime).toBeLessThanOrEqual(
          expectedReadingTime + 2,
        );
      } else {
        expect(content.estimatedReadingTime).toBeUndefined();
      }

      if (expectedType !== ResourceType.DOCUMENT) {
        expect(content.content).toBeDefined();
        expect(content.content).not.toHaveLength(0);
      } else {
        expect(content.content).toBeUndefined();
      }
    },
  );

  // pdf-parse's real implementation requires PDF.js workers (--experimental-vm-modules)
  // and cannot run inside Jest. We spy on extractTitleFromPdf to isolate the HTTP fetch
  // path (content-type detection, buffer capture) from the PDF parsing step.
  it('should fetch https://arxiv.org/pdf/2505.18397 and extract correct metadata', async () => {
    const url = 'https://arxiv.org/pdf/2505.18397';
    const expectedTitle =
      'An Outlook on the Opportunities and Challenges of Multi-Agent AI Systems';
    const gw = new ResourceGateway();
    const extractTitleSpy = jest
      .spyOn(gw, 'extractTitleFromPdf')
      .mockResolvedValue(expectedTitle);

    const result = await gw.get(url);

    expect(result.isOk()).toBe(true);
    const content = result.unwrap();
    expect(content.source.url).toBe(url);
    expect(content.source.name).toBe('arxiv.org');
    expect(content.name).toBe(expectedTitle);
    expect(content.type).toBe(ResourceType.DOCUMENT);
    expect(content.estimatedReadingTime).toBeUndefined();
    expect(extractTitleSpy).toHaveBeenCalledWith(expect.any(Buffer));
  });

  it('should handle fetch errors gracefully', async () => {
    const url = 'https://nonexistentdomain.example.com/resource';
    const gw = new ResourceGateway();
    const fetchErr = new TypeError('fetch failed');
    jest.spyOn(globalThis, 'fetch').mockRejectedValueOnce(fetchErr);

    jest.spyOn(gw as any, 'fetchWithPuppeteer').mockResolvedValueOnce(
      // Return an Err result so the gateway returns a failure
      { isErr: () => true, unwrapErr: () => fetchErr },
    );

    const resourceDetails = await gw.get(url);

    expect(resourceDetails.isErr()).toBe(true);
    const error = resourceDetails.unwrapErr();
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toContain('Failed to fetch resource from');
  });

  it('should handle unsupported resource types appropriately', async () => {
    const url =
      'https://www.cmu.edu/blackboard/files/evaluate/tests-example.xls';
    const gw = new ResourceGateway();

    const resourceDetails = await gw.get(url);

    expect(resourceDetails.isErr()).toBe(true);
    const error = resourceDetails.unwrapErr();
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toContain('Unsupported resource type at');
  });

  // Additional tests for other URLs that have caused issues in the past
  // this helps ensure robustness against a variety of real-world content
  // and adapt gateway HTTP calls.
  it.each([
    'https://longform.asmartbear.com/impostor-syndrome/',
    'https://longform.asmartbear.com/investment/',
    'https://longform.asmartbear.com/focus/',
    'https://queue.acm.org/detail.cfm?id=3454124',
    'https://www.uber.com/en-FR/blog/mysql-at-uber/',
    'https://jimmyhmiller.com/overly-humble-programmer',
  ])('should extract information from: %s', async (url) => {
    const gw = new ResourceGateway();

    const resourceDetails = await gw.get(url);

    expect(resourceDetails.isOk()).toBe(true);
    const content = resourceDetails.unwrap();
    expect(content.source.url).toBe(url);
    expect(content.source.name).not.toHaveLength(0);
    expect(content.name).not.toHaveLength(0);
    expect(content.type).toBe(ResourceType.TEXT);
    expect(content.estimatedReadingTime).not.toBe(0);
    // ensure we return article content for text resources
    expect(content.content).toBeDefined();
    expect(content.content).not.toHaveLength(0);
  });

  it('should bypass Cloudflare protections when necessary', async () => {
    const url = 'https://queue.acm.org/detail.cfm?id=3454124'; // known to have Cloudflare
    const gw = new ResourceGateway();

    const resourceDetails = await gw.get(url);
    expect(resourceDetails.isOk()).toBe(true);
    const content = resourceDetails.unwrap();
    expect(content.source.url).toBe(url);
    expect(content.source.name).toBe('queue.acm.org');
    expect(content.name).toBe(
      'The SPACE of Developer Productivity - ACM Queue',
    );
    expect(content.type).toBe(ResourceType.TEXT);
    expect(content.estimatedReadingTime).not.toBe(0);
    expect(content.content).toBeDefined();
    expect(content.content).not.toHaveLength(0);
  });

  it('should handle access denied responses', async () => {
    const url = 'https://www.uber.com/en-FR/blog/mysql-at-uber/';
    const gw = new ResourceGateway();

    const resourceDetails = await gw.get(url);

    expect(resourceDetails.isOk()).toBe(true);
    const content = resourceDetails.unwrap();
    expect(content.name).toBe('MySQL At Uber | Uber Blog');
    expect(content.source.url).toBe(url);
    expect(content.source.name).toBe('www.uber.com');
    expect(content.type).toBe(ResourceType.TEXT);
    expect(content.estimatedReadingTime).not.toBe(0);
    expect(content.content).toBeDefined();
    expect(content.content).not.toHaveLength(0);
  });

  describe('extractTitleFromPdf', () => {
    let gw: ResourceGateway;

    beforeEach(() => {
      gw = new ResourceGateway();
      mockGetInfo.mockReset();
    });

    it('should return the title from PDF metadata when present', async () => {
      mockGetInfo.mockResolvedValue({
        info: {
          Title:
            'An Outlook on the Opportunities and Challenges of Multi-Agent AI Systems',
        },
      });

      const title = await gw.extractTitleFromPdf(Buffer.from('fake-pdf'));

      expect(title).toBe(
        'An Outlook on the Opportunities and Challenges of Multi-Agent AI Systems',
      );
    });

    it('should return null when PDF metadata has no title', async () => {
      mockGetInfo.mockResolvedValue({
        info: { Title: '' },
      });

      const title = await gw.extractTitleFromPdf(Buffer.from('fake-pdf'));

      expect(title).toBeNull();
    });

    it('should return null when PDF metadata is missing the Title field', async () => {
      mockGetInfo.mockResolvedValue({
        info: {},
      });

      const title = await gw.extractTitleFromPdf(Buffer.from('fake-pdf'));

      expect(title).toBeNull();
    });

    it('should return null and not throw when pdf-parse throws', async () => {
      mockGetInfo.mockRejectedValue(new Error('corrupted PDF'));

      const title = await gw.extractTitleFromPdf(Buffer.from('bad-pdf'));

      expect(title).toBeNull();
    });

    it('should trim whitespace from the title', async () => {
      mockGetInfo.mockResolvedValue({
        info: { Title: '  My Paper Title  ' },
      });

      const title = await gw.extractTitleFromPdf(Buffer.from('fake-pdf'));

      expect(title).toBe('My Paper Title');
    });
  });
});
