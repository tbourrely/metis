import { ResourceType } from '../domain/resource.types';
import { ResourceGateway } from './resource.gateway';

const mockGetInfo = jest.fn();

// pdf-parse is mocked so the module resolves cleanly in Jest.
// The arXiv test spies on extractTitleFromPdf directly, so mockGetInfo is
// never actually called during integration runs — but the mock must be present
// because Jest hoists jest.mock() before imports.
jest.mock('pdf-parse', () => ({
  PDFParse: jest.fn().mockImplementation(() => ({ getInfo: mockGetInfo })),
}));

// Real-network integration tests — intentionally excluded from the default
// jest run (npm test) via testPathIgnorePatterns in jest.config.ts.
// Run locally with: npm run test:integration
describe('ResourceGateway (integration)', () => {
  beforeAll(() => {
    jest.setTimeout(30_000);
  });

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
    expect(content.content).toBeDefined();
    expect(content.content).not.toHaveLength(0);
  });

  it('should bypass Cloudflare protections when necessary', async () => {
    const url = 'https://queue.acm.org/detail.cfm?id=3454124';
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
});
