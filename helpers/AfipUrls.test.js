const { AFIP_URLS, AfipUrls } = require('./AfipUrls');

describe('AfipUrls', () => {
  describe('constructor', () => {
    afterEach(() => {
        delete process.env.HOMO
    })
    it('should set urls to HOMO if HOMO environment variable is set', () => {
      process.env.HOMO = 'true';
      expect(AfipUrls.urls).toBe(AFIP_URLS.HOMO);
    });

    it('should set urls to PROD if HOMO environment variable is not set', () => {
        expect(AfipUrls.urls).toBe(AFIP_URLS.PROD);
    });
  });

  describe('wsaa', () => {
    it('should return the prod WSAA URL', () => {
      expect(AfipUrls.wsaa).toBe(AFIP_URLS.PROD.wsaa);
    });
  });

  describe('getService', () => {
    it('should return the URL for a given service', () => {
      const service = 'example';
      const expectedUrl = AfipUrls.urls.service.replace('{service}', service);
      expect(AfipUrls.getService(service)).toBe(expectedUrl);
    });
  });
});