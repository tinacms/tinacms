/**
 * PROTOTYPE: Plugin Architecture for External Search Providers
 *
 * This prototype demonstrates a flexible plugin-style architecture
 * that allows integration with external search providers like Algolia,
 * while maintaining compatibility with the existing SearchClient interface.
 */

import type { SearchClient } from '../types';

/**
 * Base interface for all search plugins
 * Extends the existing SearchClient interface for compatibility
 */
export interface SearchPlugin extends SearchClient {
  /**
   * Plugin metadata
   */
  readonly name: string;
  readonly version: string;

  /**
   * Initialize the plugin with configuration
   */
  initialize?(config: Record<string, any>): Promise<void>;

  /**
   * Clean up plugin resources
   */
  destroy?(): Promise<void>;

  /**
   * Plugin-specific capabilities
   */
  capabilities(): SearchCapabilities;
}

/**
 * Describes what features a search plugin supports
 */
export interface SearchCapabilities {
  fuzzySearch: boolean;
  prefixSearch: boolean;
  phraseSearch: boolean;
  faceting: boolean;
  typoTolerance: boolean;
  synonyms: boolean;
  highlighting: boolean;
  geoSearch: boolean;
  analytics: boolean;
}

/**
 * Configuration for search plugins
 */
export interface SearchPluginConfig {
  /** Which plugin to use */
  provider: 'local' | 'algolia' | 'typesense' | 'custom';

  /** Plugin-specific configuration */
  config?: Record<string, any>;

  /** Fallback to local search if remote fails */
  fallback?: boolean;
}

/**
 * Example: Algolia Plugin Implementation
 */
export class AlgoliaSearchPlugin implements SearchPlugin {
  readonly name = 'algolia';
  readonly version = '1.0.0';

  private client: any; // Would be: algoliasearch.SearchClient
  private index: any;

  constructor(
    private appId: string,
    private apiKey: string,
    private indexName: string
  ) {}

  async initialize(config: Record<string, any>): Promise<void> {
    // Would initialize Algolia client
    // const algoliasearch = require('algoliasearch');
    // this.client = algoliasearch(this.appId, this.apiKey);
    // this.index = this.client.initIndex(this.indexName);

    console.log('Algolia plugin initialized with config:', config);
  }

  capabilities(): SearchCapabilities {
    return {
      fuzzySearch: true,
      prefixSearch: true,
      phraseSearch: true,
      faceting: true,
      typoTolerance: true,
      synonyms: true,
      highlighting: true,
      geoSearch: true,
      analytics: true,
    };
  }

  async query(
    query: string,
    options?: { cursor?: string; limit?: number }
  ): Promise<{
    results: any[];
    total: number;
    nextCursor: string | null;
    prevCursor: string | null;
  }> {
    // Would call Algolia API
    // const { hits, nbHits, page } = await this.index.search(query, {
    //   hitsPerPage: options?.limit || 20,
    //   page: options?.cursor ? parseInt(options.cursor) : 0,
    //   typoTolerance: true,
    //   minWordSizefor1Typo: 3,
    //   minWordSizefor2Typos: 7
    // });

    // Transform Algolia response to match SearchClient interface
    return {
      results: [],
      total: 0,
      nextCursor: null,
      prevCursor: null,
    };
  }

  async put(docs: any[]): Promise<any> {
    // Would save objects to Algolia
    // await this.index.saveObjects(docs);
    return { success: true };
  }

  async del(ids: string[]): Promise<any> {
    // Would delete objects from Algolia
    // await this.index.deleteObjects(ids);
    return { success: true };
  }

  supportsClientSideIndexing(): boolean {
    return false; // Algolia is server-side
  }
}

/**
 * Example: Typesense Plugin Implementation
 */
export class TypesenseSearchPlugin implements SearchPlugin {
  readonly name = 'typesense';
  readonly version = '1.0.0';

  private client: any;

  constructor(
    private config: {
      nodes: Array<{ host: string; port: number; protocol: string }>;
      apiKey: string;
      collectionName: string;
    }
  ) {}

  async initialize(): Promise<void> {
    // Would initialize Typesense client
    // const Typesense = require('typesense');
    // this.client = new Typesense.Client({
    //   nodes: this.config.nodes,
    //   apiKey: this.config.apiKey,
    //   connectionTimeoutSeconds: 2
    // });

    console.log('Typesense plugin initialized');
  }

  capabilities(): SearchCapabilities {
    return {
      fuzzySearch: true,
      prefixSearch: true,
      phraseSearch: true,
      faceting: true,
      typoTolerance: true,
      synonyms: true,
      highlighting: true,
      geoSearch: true,
      analytics: false,
    };
  }

  async query(
    query: string,
    options?: { cursor?: string; limit?: number }
  ): Promise<{
    results: any[];
    total: number;
    nextCursor: string | null;
    prevCursor: string | null;
  }> {
    // Would call Typesense API
    // const searchResults = await this.client
    //   .collections(this.config.collectionName)
    //   .documents()
    //   .search({
    //     q: query,
    //     query_by: 'title,content',
    //     per_page: options?.limit || 20,
    //     page: options?.cursor ? parseInt(options.cursor) : 1,
    //     typo_tokens_threshold: 2,
    //     num_typos: 2
    //   });

    return {
      results: [],
      total: 0,
      nextCursor: null,
      prevCursor: null,
    };
  }

  async put(docs: any[]): Promise<any> {
    // Would import documents to Typesense
    return { success: true };
  }

  async del(ids: string[]): Promise<any> {
    // Would delete documents from Typesense
    return { success: true };
  }

  supportsClientSideIndexing(): boolean {
    return false; // Typesense is server-side
  }
}

/**
 * Search Plugin Manager
 * Manages plugin lifecycle and provides unified interface
 */
export class SearchPluginManager {
  private plugin: SearchPlugin | null = null;
  private fallbackPlugin: SearchPlugin | null = null;

  /**
   * Register and initialize a search plugin
   */
  async use(plugin: SearchPlugin, config?: Record<string, any>): Promise<void> {
    this.plugin = plugin;

    if (plugin.initialize) {
      await plugin.initialize(config || {});
    }
  }

  /**
   * Set a fallback plugin (e.g., local search when remote fails)
   */
  async useFallback(plugin: SearchPlugin): Promise<void> {
    this.fallbackPlugin = plugin;
  }

  /**
   * Get the search client interface
   */
  getClient(): SearchClient {
    if (!this.plugin) {
      throw new Error('No search plugin registered');
    }

    // Return a wrapped client that handles fallback
    return {
      query: async (query, options) => {
        try {
          return await this.plugin!.query(query, options);
        } catch (error) {
          console.error('Primary search plugin failed:', error);

          if (this.fallbackPlugin) {
            console.log('Falling back to secondary search plugin');
            return await this.fallbackPlugin.query(query, options);
          }

          throw error;
        }
      },

      put: async (docs) => {
        if (!this.plugin) throw new Error('No plugin registered');
        return await this.plugin.put(docs);
      },

      del: async (ids) => {
        if (!this.plugin) throw new Error('No plugin registered');
        return await this.plugin.del(ids);
      },

      supportsClientSideIndexing: () => {
        return this.plugin?.supportsClientSideIndexing?.() ?? false;
      },
    };
  }

  /**
   * Check plugin capabilities
   */
  getCapabilities(): SearchCapabilities | null {
    return this.plugin?.capabilities() || null;
  }

  /**
   * Clean up resources
   */
  async destroy(): Promise<void> {
    if (this.plugin?.destroy) {
      await this.plugin.destroy();
    }
    if (this.fallbackPlugin?.destroy) {
      await this.fallbackPlugin.destroy();
    }
  }
}

/**
 * EXAMPLE USAGE:
 *
 * // Initialize with Algolia
 * const manager = new SearchPluginManager();
 * const algoliaPlugin = new AlgoliaSearchPlugin(
 *   'APP_ID',
 *   'API_KEY',
 *   'index_name'
 * );
 * await manager.use(algoliaPlugin, {
 *   typoTolerance: true,
 *   minWordSizefor1Typo: 3
 * });
 *
 * // Optionally set a local fallback
 * const localPlugin = new LocalSearchPlugin();
 * await manager.useFallback(localPlugin);
 *
 * // Use the unified interface
 * const client = manager.getClient();
 * const results = await client.query('search query', { limit: 10 });
 *
 * // Check what features are available
 * const capabilities = manager.getCapabilities();
 * if (capabilities?.fuzzySearch) {
 *   // Use fuzzy search features
 * }
 */

/**
 * ARCHITECTURE ADVANTAGES:
 *
 * 1. Flexibility: Easy to switch between providers
 * 2. Consistent Interface: All plugins implement SearchClient
 * 3. Fallback Support: Graceful degradation to local search
 * 4. Feature Detection: Can query capabilities at runtime
 * 5. Zero Breaking Changes: Maintains existing SearchClient API
 * 6. Testability: Easy to mock plugins for testing
 * 7. Extensibility: Users can implement custom plugins
 *
 * IMPLEMENTATION CONSIDERATIONS:
 *
 * 1. Need to map external provider features to SearchClient interface
 * 2. Each provider has different pricing models
 * 3. Network latency vs local search performance
 * 4. Data synchronization between local and remote
 * 5. Authentication and security
 * 6. Rate limiting and quota management
 * 7. Error handling and retry logic
 */

/**
 * COST CONSIDERATIONS:
 *
 * Algolia:
 * - Free tier: 10k searches/month, 10k records
 * - Paid: ~$0.50 per 1k searches
 * - Best for: Production apps with high query volume
 *
 * Typesense:
 * - Self-hosted (free) or cloud ($0.03/hour)
 * - Best for: Teams wanting control over infrastructure
 *
 * Local (search-index):
 * - Free, no external dependencies
 * - Best for: Offline-first, privacy-focused, or small datasets
 */
