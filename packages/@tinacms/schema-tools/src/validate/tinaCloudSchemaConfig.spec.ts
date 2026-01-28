import { validateTinaCloudSchemaConfig } from './tinaCloudSchemaConfig';

describe('validateTinaCloudSchemaConfig', () => {
  describe('search.tina config', () => {
    it('accepts empty config', () => {
      expect(() => validateTinaCloudSchemaConfig({})).not.toThrow();
    });

    it('accepts config with only search.tina.fuzzyEnabled', () => {
      const config = {
        search: {
          tina: {
            fuzzyEnabled: true,
          },
        },
      };
      expect(() => validateTinaCloudSchemaConfig(config)).not.toThrow();
    });

    it('accepts config with only search.tina.fuzzyEnabled set to false', () => {
      const config = {
        search: {
          tina: {
            fuzzyEnabled: false,
          },
        },
      };
      expect(() => validateTinaCloudSchemaConfig(config)).not.toThrow();
    });

    it('accepts config with only search.tina.fuzzyOptions', () => {
      const config = {
        search: {
          tina: {
            fuzzyOptions: {
              maxDistance: 2,
            },
          },
        },
      };
      expect(() => validateTinaCloudSchemaConfig(config)).not.toThrow();
    });

    it('accepts config with partial fuzzyOptions', () => {
      const config = {
        search: {
          tina: {
            fuzzyOptions: {
              minSimilarity: 0.8,
            },
          },
        },
      };
      expect(() => validateTinaCloudSchemaConfig(config)).not.toThrow();
    });

    it('accepts config with all fuzzyOptions fields', () => {
      const config = {
        search: {
          tina: {
            fuzzyOptions: {
              maxDistance: 2,
              minSimilarity: 0.6,
              maxTermExpansions: 10,
              useTranspositions: true,
              caseSensitive: false,
            },
          },
        },
      };
      expect(() => validateTinaCloudSchemaConfig(config)).not.toThrow();
    });

    it('accepts config with both fuzzyEnabled and fuzzyOptions', () => {
      const config = {
        search: {
          tina: {
            fuzzyEnabled: true,
            fuzzyOptions: {
              maxDistance: 3,
              minSimilarity: 0.5,
            },
          },
        },
      };
      expect(() => validateTinaCloudSchemaConfig(config)).not.toThrow();
    });

    it('accepts config with all search.tina fields', () => {
      const config = {
        search: {
          tina: {
            indexerToken: 'test-token',
            stopwordLanguages: ['en'],
            tokenSplitRegex: '\\s+',
            fuzzyEnabled: false,
            fuzzyOptions: {
              maxDistance: 2,
              minSimilarity: 0.6,
              maxTermExpansions: 10,
              useTranspositions: true,
              caseSensitive: false,
            },
          },
        },
      };
      expect(() => validateTinaCloudSchemaConfig(config)).not.toThrow();
    });

    it('accepts config with search-level options alongside tina', () => {
      const config = {
        search: {
          tina: {
            fuzzyEnabled: false,
          },
          indexBatchSize: 100,
          maxSearchIndexFieldLength: 5000,
        },
      };
      expect(() => validateTinaCloudSchemaConfig(config)).not.toThrow();
    });

    it('rejects unrecognized keys in search.tina (strict mode)', () => {
      const config = {
        search: {
          tina: {
            fuzzyEnabled: false,
            unknownField: 'should fail',
          },
        },
      };
      expect(() => validateTinaCloudSchemaConfig(config)).toThrow();
    });

    it('rejects unrecognized keys in fuzzyOptions (strict mode)', () => {
      const config = {
        search: {
          tina: {
            fuzzyOptions: {
              maxDistance: 2,
              unknownOption: true,
            },
          },
        },
      };
      expect(() => validateTinaCloudSchemaConfig(config)).toThrow();
    });

    it('rejects wrong type for fuzzyEnabled', () => {
      const config = {
        search: {
          tina: {
            fuzzyEnabled: 'true',
          },
        },
      };
      expect(() => validateTinaCloudSchemaConfig(config)).toThrow();
    });

    it('rejects wrong type for fuzzyOptions.maxDistance', () => {
      const config = {
        search: {
          tina: {
            fuzzyOptions: {
              maxDistance: '2',
            },
          },
        },
      };
      expect(() => validateTinaCloudSchemaConfig(config)).toThrow();
    });

    it('rejects wrong type for fuzzyOptions.minSimilarity', () => {
      const config = {
        search: {
          tina: {
            fuzzyOptions: {
              minSimilarity: '0.8',
            },
          },
        },
      };
      expect(() => validateTinaCloudSchemaConfig(config)).toThrow();
    });
  });

  describe('other config sections', () => {
    it('accepts media config', () => {
      const config = {
        media: {
          tina: {
            publicFolder: 'public',
            mediaRoot: 'uploads',
          },
        },
      };
      expect(() => validateTinaCloudSchemaConfig(config)).not.toThrow();
    });

    it('accepts client config', () => {
      const config = {
        client: {
          referenceDepth: 3,
        },
      };
      expect(() => validateTinaCloudSchemaConfig(config)).not.toThrow();
    });

    it('accepts ui config', () => {
      const config = {
        ui: {
          optOutOfUpdateCheck: true,
        },
      };
      expect(() => validateTinaCloudSchemaConfig(config)).not.toThrow();
    });

    it('accepts combined config with all sections', () => {
      const config = {
        client: {
          referenceDepth: 2,
        },
        media: {
          tina: {
            publicFolder: 'public',
            mediaRoot: 'images',
          },
        },
        search: {
          tina: {
            fuzzyEnabled: false,
            fuzzyOptions: {
              maxDistance: 2,
            },
          },
          indexBatchSize: 50,
        },
        ui: {
          optOutOfUpdateCheck: false,
        },
      };
      expect(() => validateTinaCloudSchemaConfig(config)).not.toThrow();
    });
  });
});
