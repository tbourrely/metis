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
