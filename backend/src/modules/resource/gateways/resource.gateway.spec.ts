import { ResourceType } from '../domain/resource.types';
import { ResourceGateway } from './resource.gateway';

describe('ResourceGateway', () => {
  it.each([
    {
      url: 'https://martinfowler.com/bliki/Yagni.html',
      expectedName: 'Yagni',
      expectedType: ResourceType.TEXT,
      expectedSourceName: 'martinfowler.com',
    },
    {
      url: 'https://www.dddcommunity.org/wp-content/uploads/files/pdf_articles/Vernon_2011_1.pdf',
      expectedName: 'Vernon_2011_1.pdf',
      expectedType: ResourceType.DOCUMENT,
      expectedSourceName: 'www.dddcommunity.org',
    },
  ])(
    'should fetch $url and extract correct metadata',
    async ({ url, expectedName, expectedType, expectedSourceName }) => {
      const gw = new ResourceGateway();

      const resourceDetails = await gw.get(url);

      expect(resourceDetails.isOk()).toBe(true);
      const content = resourceDetails.unwrap();
      expect(content.source.url).toBe(url);
      expect(content.source.name).toBe(expectedSourceName);
      expect(content.name).toBe(expectedName);
      expect(content.type).toBe(expectedType);
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
});
