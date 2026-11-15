import path from 'node:path';
import {
  type LoadTinaConfigOptions,
  openTinaConfig,
} from '../../codegen/load-config';
import type { TinaDocument } from '../../core/schema/types';
import { invariant } from '../../core/invariant';
import { capabilityProvider } from '../../core/mount';
import { isSearchError } from '../../core/search/contract';
import type { SearchRecord } from '../../core/search/index-contract';
import { buildSearchRecord } from '../../core/search/record';
import { createLocalDataLayer } from '../../plugins/content/local/server/local-data-layer';
import { runInServerRuntime } from '../../rpc/handler';
import { findConfigPath } from './codegen';

export interface ReindexOptions {
  rootDir: string;
  configPath?: string;
  load?: LoadTinaConfigOptions;
  log: (message: string) => void;
}

const describeFailure = (cause: unknown): Error => {
  if (isSearchError(cause)) {
    return new Error(
      cause.detail ? `${cause.message} (${cause.detail})` : cause.message
    );
  }
  if (cause instanceof Error) return cause;
  return new Error(String(cause));
};

/**
 * ADR-021 §4: rebuilds the search index from the files of the checkout. It
 * calls the provider's `replace` once, and never when anything looks wrong.
 */
export const runSearchReindex = async (
  options: ReindexOptions
): Promise<void> => {
  const configPath =
    options.configPath ?? (await findConfigPath(options.rootDir));
  const { config, close } = await openTinaConfig(configPath, options.load);
  try {
    const provider = capabilityProvider(config.plugins, 'search');
    invariant(
      provider,
      'search-no-plugin',
      'No plugin provides `search`. Add one to `plugins` in tina/config.'
    );
    await runInServerRuntime(config.plugins, config.schema, async (runtime) => {
      const index = runtime.searchIndex;
      invariant(
        index && provider.search,
        'search-no-index-provider',
        'The `search` plugin has no index provider, so there is nothing to reindex.'
      );
      const { fields } = provider.search;
      const collections = Object.keys(fields).map((name) => {
        const collection = config.schema.collections.find(
          (candidate) => candidate.name === name
        );
        invariant(
          collection,
          'search-unknown-collection',
          `The search plugin lists the collection "${name}", but the schema has no such collection.`
        );
        invariant(
          collection.path,
          'content-collection-no-path',
          `Collection "${name}" has no \`path\`: reindex needs one to locate its files.`
        );
        return collection;
      });
      // Every collection with a `path` goes to the reader, so a file belongs to
      // the same collection here as it does for `content.list` (the deepest
      // match). Only the collections in `fields` are read and indexed.
      const reader = createLocalDataLayer({
        rootDir: path.resolve(options.rootDir),
        collections: config.schema.collections.filter(
          ({ path: folder }) => folder
        ),
      });
      const records: SearchRecord[] = [];
      try {
        for (const collection of collections) {
          let count = 0;
          for (const { path: documentPath } of await reader.list(
            collection.name
          )) {
            let document: TinaDocument | undefined;
            try {
              document = (await reader.get(collection.name, documentPath))
                ?.document;
            } catch (cause) {
              throw new Error(
                `Cannot read "${documentPath}": ${describeFailure(cause).message}`
              );
            }
            if (!document) continue;
            records.push(
              buildSearchRecord(
                collection,
                documentPath,
                document,
                fields[collection.name]
              )
            );
            count += 1;
          }
          options.log(`${collection.name}: ${count} documents`);
        }
      } finally {
        await reader.close();
      }
      invariant(
        records.length > 0,
        'search-no-documents',
        'Found no documents to index. Check `--root`.'
      );
      try {
        await index.replace(records);
      } catch (cause) {
        throw describeFailure(cause);
      }
      options.log(`Indexed ${records.length} documents.`);
    });
  } finally {
    await close();
  }
};
