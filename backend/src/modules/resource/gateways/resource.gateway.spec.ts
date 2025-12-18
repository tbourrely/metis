import { ResourceType } from '../domain/resource.types';
import { ResourceGateway } from './resource.gateway';

describe('ResourceGateway', () => {
  jest.retryTimes(2); // Retry tests up to 2 times in case of transient network issues

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
        'What happens when the coding becomes the least interesting part of the work | by Obie Fernandez | Dec, 2025 | Medium',
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
        expect(content.estimatedReadingTime).toBe(expectedReadingTime);
      } else {
        expect(content.estimatedReadingTime).toBeUndefined();
      }
    },
  );

  it('should handle fetch errors gracefully', async () => {
    const url = 'https://nonexistentdomain.example.com/resource';
    const gw = new ResourceGateway();

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
  ])('should extract information from: %s', async (url) => {
    const gw = new ResourceGateway();

    const resourceDetails = await gw.get(url);

    expect(resourceDetails.isOk()).toBe(true);
    const content = resourceDetails.unwrap();
    expect(content.source.url).toBe(url);
    expect(content.source.name).not.toHaveLength(0);
    expect(content.name).not.toHaveLength(0);
    expect(content.type).toBe(ResourceType.TEXT);
    expect(content.estimatedReadingTime).toBeDefined();
  });
});
