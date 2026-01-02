import path from 'path';
import { Database, FilesystemBridge, buildSchema } from '@tinacms/graphql';
import { LocalSearchIndexClient, SearchIndexer } from '@tinacms/search';
import AsyncLock from 'async-lock';
import chokidar from 'chokidar';
import { Command, Option } from 'clipanion';
import fs from 'fs-extra';
import { logger, summary } from '../../../logger';
import { spin } from '../../../utils/spinner';
import { dangerText, warnText } from '../../../utils/theme';
import { Codegen } from '../../codegen';
import { ConfigManager } from '../../config-manager';
import { createAndInitializeDatabase, createDBServer } from '../../database';
import { BaseCommand } from '../baseCommands';
import { devHTML } from './html';
import { createDevServer } from './server';

export class DevCommand extends BaseCommand {
  static paths = [['dev'], ['server:start']];
  // NOTE: camelCase commands for string options don't work if there's an `=` used https://github.com/arcanis/clipanion/issues/141
  watchFolders = Option.String('-w,--watchFolders', {
    description:
      'DEPRECATED - a list of folders (relative to where this is being run) that the cli will watch for changes',
  });
  noWatch = Option.Boolean('--noWatch', false, {
    description: "Don't regenerate config on file changes",
  });
  outputSearchIndexPath = Option.String('--outputSearchIndexPath', {
    description: 'Path to write the search index to',
  });
  noServer = Option.Boolean('--no-server', false, {
    description: 'Do not start the dev server',
  });
  indexingLock: AsyncLock = new AsyncLock(); // Prevent indexes and reads occurring at once

  static usage = Command.Usage({
    category: `Commands`,
    description: `Builds Tina and starts the dev server`,
    examples: [
      [`A basic example`, `$0 dev`],
      [`A second example`, `$0 dev --rootPath`],
    ],
  });

  async catch(error: any): Promise<void> {
    logger.error('Error occured during tinacms dev');
    console.error(error);
    process.exit(1);
  }

  logDeprecationWarnings() {
    super.logDeprecationWarnings();
    if (this.watchFolders) {
      logger.warn(
        '--watchFolders has been deprecated, imports from your Tina config file will be watched automatically. If you still need it please open a ticket at https://github.com/tinacms/tinacms/issues'
      );
    }
  }

  async execute(): Promise<number | void> {
    const configManager = new ConfigManager({
      rootPath: this.rootPath,
      legacyNoSDK: this.noSDK,
    });
    logger.info('🦙 TinaCMS Dev Server is initializing...');
    this.logDeprecationWarnings();

    // Initialize the host TCP server
    createDBServer(Number(this.datalayerPort));

    let database: Database = null;
    const dbLock = async (fn: () => Promise<void>) => {
      return this.indexingLock.acquire('Key', fn);
    };

    const setup = async ({ firstTime }: { firstTime: boolean }) => {
      try {
        await configManager.processConfig();
        if (firstTime) {
          database = await createAndInitializeDatabase(
            configManager,
            Number(this.datalayerPort)
          );
        } else {
          database.clearCache();
        }

        const { tinaSchema, graphQLSchema, lookup, queryDoc, fragDoc } =
          await buildSchema(configManager.config);

        const codegen = new Codegen({
          isLocal: true,
          configManager: configManager,
          port: Number(this.port),
          queryDoc,
          fragDoc,
          graphqlSchemaDoc: graphQLSchema,
          tinaSchema,
          lookup,
          noClientBuildCache: true,
        });
        const apiURL = await codegen.execute();

        if (!configManager.isUsingLegacyFolder) {
          const schemaObject = await fs.readJSON(
            configManager.generatedSchemaJSONPath
          );
          const lookupObject = await fs.readJSON(
            configManager.generatedLookupJSONPath
          );
          const graphqlSchemaObject = await fs.readJSON(
            configManager.generatedGraphQLJSONPath
          );

          const tinaLockFilename = 'tina-lock.json';
          const tinaLockContent = JSON.stringify({
            schema: schemaObject,
            lookup: lookupObject,
            graphql: graphqlSchemaObject,
          });
          fs.writeFileSync(
            path.join(configManager.tinaFolderPath, tinaLockFilename),
            tinaLockContent
          );

          if (configManager.hasSeparateContentRoot()) {
            const rootPath = await configManager.getTinaFolderPath(
              configManager.contentRootPath
            );
            const filePath = path.join(rootPath, tinaLockFilename);
            await fs.ensureFile(filePath);
            await fs.outputFile(filePath, tinaLockContent);
          }
        }

        await this.indexContentWithSpinner({
          database,
          graphQLSchema,
          tinaSchema,
          configManager,
        });
        if (!firstTime) {
          logger.error('Re-index complete');
        }

        if (!this.noWatch) {
          this.watchQueries(
            configManager,
            dbLock,
            async () => await codegen.execute()
          );
        }

        return { apiURL, database, graphQLSchema, tinaSchema };
      } catch (e) {
        logger.error(`\n\n${dangerText(e.message)}\n`);
        if (this.verbose) {
          console.error(e);
        }
        if (firstTime) {
          logger.error(
            warnText(
              'Unable to start dev server, please fix your Tina config / resolve any errors above and try again'
            )
          );
          process.exit(1);
        } else {
          logger.error(warnText('Dev server has not been restarted'));
        }
      }
    };
    const { apiURL, graphQLSchema, tinaSchema } = await setup({
      firstTime: true,
    });

    await fs.outputFile(configManager.outputHTMLFilePath, devHTML(this.port));
    // Add the gitignore so the index.html and assets are committed to git
    await fs.outputFile(
      configManager.outputGitignorePath,
      'index.html\nassets/'
    );
    const searchIndexClient = new LocalSearchIndexClient({
      stopwordLanguages: configManager.config.search?.tina?.stopwordLanguages,
      tokenSplitRegex: configManager.config.search?.tina?.tokenSplitRegex,
    });
    await searchIndexClient.onStartIndexing();

    const searchIndexer = new SearchIndexer({
      batchSize: configManager.config.search?.indexBatchSize || 100,
      bridge: new FilesystemBridge(
        configManager.rootPath,
        configManager.contentRootPath
      ),
      schema: tinaSchema,
      client: searchIndexClient,
      textIndexLength:
        configManager.config.search?.maxSearchIndexFieldLength || 100,
    });

    if (configManager.config.search) {
      await spin({
        waitFor: async () => {
          await searchIndexer.indexAllContent();
        },
        text: 'Building search index',
      });

      if (this.outputSearchIndexPath) {
        await searchIndexClient.export(this.outputSearchIndexPath);
      }
    }

    if (this.noServer) {
      logger.info('--no-server option specified - Dev server not started');
      process.exit(0);
    }
    if (!this.noWatch) {
      this.watchContentFiles(
        configManager,
        database,
        dbLock,
        configManager.config.search && searchIndexer
      );
    }

    // Pass both searchIndex and fuzzySearchWrapper
    const searchIndexWithFuzzy = searchIndexClient.searchIndex as
      | (typeof searchIndexClient.searchIndex & {
          fuzzySearchWrapper?: typeof searchIndexClient.fuzzySearchWrapper;
        })
      | undefined;
    if (searchIndexWithFuzzy && searchIndexClient.fuzzySearchWrapper) {
      searchIndexWithFuzzy.fuzzySearchWrapper =
        searchIndexClient.fuzzySearchWrapper;
    }

    const server = await createDevServer(
      configManager,
      database,
      searchIndexWithFuzzy,
      apiURL,
      this.noWatch,
      dbLock
    );
    await server.listen(Number(this.port));

    if (!this.noWatch) {
      chokidar.watch(configManager.watchList).on('change', async () => {
        await dbLock(async () => {
          logger.info(`Tina config change detected, rebuilding`);
          await setup({ firstTime: false });
          // The setup process results in an update to the prebuild file
          // But Vite doesn't reload when it's changed for some reason
          // So we're triggering the reload ourselves
          server.ws.send({ type: 'full-reload', path: '*' });
        });
      });
    }

    const subItems = [];

    if (configManager.hasSeparateContentRoot()) {
      subItems.push({
        key: 'Content repo',
        value: configManager.contentRootPath,
      });
    }

    const summaryItems = [
      {
        emoji: '🦙',
        heading: 'TinaCMS URLs',
        subItems: [
          {
            key: 'CMS',
            value: `<your-dev-server-url>/${configManager.printoutputHTMLFilePath()}`,
          },
          {
            key: 'API playground',
            value: `<your-dev-server-url>/${configManager.printoutputHTMLFilePath()}#/graphql`,
          },
          {
            key: 'API url',
            value: apiURL,
          },
          ...subItems,
        ],
      },
    ];

    if (!configManager.shouldSkipSDK()) {
      summaryItems.push({
        emoji: '🤖',
        heading: 'Auto-generated files',
        subItems: [
          {
            key: 'GraphQL Client',
            value: configManager.printGeneratedClientFilePath(),
          },
          {
            key: 'Typescript Types',
            value: configManager.printGeneratedTypesFilePath(),
          },
        ],
      });
    }

    summary({
      heading: '✅ 🦙 TinaCMS Dev Server is active:',
      items: [
        ...summaryItems,
        // {
        //   emoji: '📚',
        //   heading: 'Useful links',
        //   subItems: [
        //     {
        //       key: 'Custom queries',
        //       value: 'https://tina.io/docs/r/content-api-overview',
        //     },
        //     {
        //       key: 'Visual editing',
        //       value: 'https://tina.io/docs/r/visual-editing-setup',
        //     },
        //   ],
        // },
      ],
    });
    await this.startSubCommand();
  }

  watchContentFiles(
    configManager: ConfigManager,
    database: Database,
    databaseLock: (fn: () => Promise<void>) => Promise<void>,
    searchIndexer?: SearchIndexer
  ) {
    const collectionContentFiles = [];
    configManager.config.schema.collections.forEach((collection) => {
      const collectionGlob = `${path.join(
        configManager.contentRootPath,
        collection.path
      )}/**/*.${collection.format || 'md'}`;
      collectionContentFiles.push(collectionGlob);
    });
    let ready = false;
    /**
     * This has no way of knowing whether the change to the file came from someone manually
     * editing in their IDE or Tina pushing the update via the Filesystem bridge. It's a simple
     * enough update that it's fine that when Tina pushes a change, we go and push that same
     * thing back through the database, and TinaCloud does the same thing when it receives
     * a push from GitHub.
     */
    chokidar
      .watch(collectionContentFiles)
      .on('ready', () => {
        ready = true;
      })
      .on('add', async (addedFile) => {
        if (!ready) {
          return;
        }
        await databaseLock(async () => {
          const pathFromRoot =
            configManager.printContentRelativePath(addedFile);
          await database
            .indexContentByPaths([pathFromRoot])
            .catch(console.error);
          if (searchIndexer) {
            await searchIndexer
              .indexContentByPaths([pathFromRoot])
              .catch(console.error);
          }
        });
      })
      .on('change', async (changedFile) => {
        const pathFromRoot =
          configManager.printContentRelativePath(changedFile);
        // Optionally we can reload the page when this happens
        // server.ws.send({ type: 'full-reload', path: '*' })
        await databaseLock(async () => {
          await database
            .indexContentByPaths([pathFromRoot])
            .catch(console.error);
          if (searchIndexer) {
            await searchIndexer
              .indexContentByPaths([pathFromRoot])
              .catch(console.error);
          }
        });
      })
      .on('unlink', async (removedFile) => {
        const pathFromRoot =
          configManager.printContentRelativePath(removedFile);
        await databaseLock(async () => {
          await database
            .deleteContentByPaths([pathFromRoot])
            .catch(console.error);
          if (searchIndexer) {
            await searchIndexer
              .deleteIndexContent([pathFromRoot])
              .catch(console.error);
          }
        });
      });
  }

  watchQueries(
    configManager: ConfigManager,
    databaseLock: (fn: () => Promise<void>) => Promise<void>,
    callback: () => Promise<string>
  ) {
    // Locking prevents multiple near-simultaneous file changes from clobbering each other.
    const executeCallback = async (_: unknown) => {
      await databaseLock(async () => {
        await callback();
      });
    };

    /**
     * This has no way of knowing whether the change to the file came from someone manually
     * editing in their IDE or Tina pushing the update via the Filesystem bridge. It's a simple
     * enough update that it's fine that when Tina pushes a change, we go and push that same
     * thing back through the database, and TinaCloud does the same thing when it receives
     * a push from GitHub.
     */
    chokidar
      .watch(configManager.userQueriesAndFragmentsGlob)
      .on('add', executeCallback)
      .on('change', executeCallback)
      .on('unlink', executeCallback);
  }
}
