import { Command, Option } from 'clipanion'
import fs from 'fs-extra'
import path from 'path'
import chokidar from 'chokidar'
import { buildSchema, Database, FilesystemBridge } from '@tinacms/graphql'
import { ConfigManager } from '../../config-manager'
import { devHTML } from './html'
import { logger, summary } from '../../../logger'
import { dangerText, warnText } from '../../../utils/theme'
import { createDevServer } from './server'
import { Codegen } from '../../codegen'
import { createAndInitializeDatabase, createDBServer } from '../../database'
import { BaseCommand } from '../baseCommands'
import { spin } from '../../../utils/spinner'
import { SearchIndexer, LocalSearchIndexClient } from '@tinacms/search'
import ts from 'typescript'

export class DevCommand extends BaseCommand {
  static paths = [['dev'], ['server:start']]
  // NOTE: camelCase commands for string options don't work if there's an `=` used https://github.com/arcanis/clipanion/issues/141
  watchFolders = Option.String('-w,--watchFolders', {
    description:
      'DEPRECATED - a list of folders (relative to where this is being run) that the cli will watch for changes',
  })
  noWatch = Option.Boolean('--noWatch', false, {
    description: "Don't regenerate config on file changes",
  })
  outputSearchIndexPath = Option.String('--outputSearchIndexPath', {
    description: 'Path to write the search index to',
  })

  static usage = Command.Usage({
    category: `Commands`,
    description: `Builds Tina and starts the dev server`,
    examples: [
      [`A basic example`, `$0 dev`],
      [`A second example`, `$0 dev --rootPath`],
    ],
  })

  async catch(error: any): Promise<void> {
    logger.error('Error occured during tinacms dev')
    console.error(error)
    process.exit(1)
  }

  logDeprecationWarnings() {
    super.logDeprecationWarnings()
    if (this.watchFolders) {
      logger.warn(
        '--watchFolders has been deprecated, imports from your Tina config file will be watched automatically. If you still need it please open a ticket at https://github.com/tinacms/tinacms/issues'
      )
    }
  }

  // findNode = (node: ts.Node, kind: ts.SyntaxKind, functionName: string): ts.Node => {
  //   if (node.kind === kind) {
  //     let expression = node.expression
  //     if (ts.isIdentifier(expression) && expression.escapedText === functionName) {
  //       return node
  //     }
  //   }
  //   return node?.forEachChild((child) => this.findNode(child, kind, functionName))
  // }

  async processConfig(configManager: ConfigManager) {
    // console.log(configManager.tinaConfigFilePath)
    const sourceFile = ts.createSourceFile(
      configManager.tinaConfigFilePath,
      fs.readFileSync(configManager.tinaConfigFilePath, 'utf8'),
      ts.ScriptTarget.Latest
    )
    function findFirstObjectLiteralArgument(
      sourceFile: ts.SourceFile,
      functionName: string
    ): ts.ObjectLiteralExpression | null {
      let foundArgument: ts.ObjectLiteralExpression | null = null

      const visit = (node: ts.Node) => {
        // If we already found a match, return
        if (foundArgument) {
          return
        }
        // Check if it's a call expression with the correct function name
        if (
          ts.isCallExpression(node) &&
          ts.isIdentifier(node.expression) &&
          node.expression.text === functionName
        ) {
          // Check if the first argument is an object literal
          if (
            node.arguments.length > 0 &&
            ts.isObjectLiteralExpression(node.arguments[0])
          ) {
            foundArgument = node.arguments[0] as ts.ObjectLiteralExpression
            return
          }
        }

        // Continue search
        ts.forEachChild(node, visit)
      }

      visit(sourceFile)

      return foundArgument
    }

    // function createVisitor(ctx: ts.TransformationContext, propertyName: string, propertyValue: ts.Expression) {
    //   const visit: ts.Visitor = (node) => {
    //     if (ts.isCallExpression(node)) {
    //       let expression = node.expression;
    //       if (ts.isIdentifier(expression) && expression.escapedText === 'defineStaticConfig') {
    //         if (node.arguments.length > 0) {
    //           let firstArg = node.arguments[0];
    //           if (ts.isObjectLiteralExpression(firstArg)) {
    //             let foundProperty = false;
    //
    //             // Map the properties of the first argument
    //             let newProperties = firstArg.properties.map(property => {
    //               if (ts.isPropertyAssignment(property)) {
    //                 let thisPropertyName = property.name.getText(sourceFile);
    //                 if (thisPropertyName === propertyName) {
    //                   foundProperty = true;
    //                   return ts.factory.createPropertyAssignment(thisPropertyName, propertyValue);
    //                 }
    //               }
    //               return property;
    //             });
    //
    //             // If the property wasn't found, add it
    //             if (!foundProperty) {
    //               const newProperty = ts.factory.createPropertyAssignment(propertyName, propertyValue);
    //               newProperties.push(newProperty);
    //             }
    //
    //             return ts.factory.createCallExpression(expression, node.typeArguments, [
    //               ts.factory.createObjectLiteralExpression(newProperties, true),
    //               ...node.arguments.slice(1)
    //             ]);
    //           }
    //         }
    //       }
    //     }
    //
    //     return ts.visitEachChild(node, visit, ctx);
    //   };
    //
    //   return visit;
    // }

    function createVisitor(
      ctx: ts.TransformationContext,
      propertyName: string,
      propertyValue: ts.Expression
    ) {
      const visit: ts.Visitor = (node) => {
        let foundProperty = false

        if (ts.isObjectLiteralExpression(node)) {
          // Map the properties of the first argument
          let newProperties = node.properties.map((property) => {
            if (ts.isPropertyAssignment(property)) {
              let thisPropertyName = property.name.getText(sourceFile)
              if (thisPropertyName === propertyName) {
                foundProperty = true
                return ts.factory.createPropertyAssignment(
                  thisPropertyName,
                  propertyValue
                )
              }
              // Recursively handle nested object properties
              if (ts.isObjectLiteralExpression(property.initializer)) {
                return ts.factory.updatePropertyAssignment(
                  property,
                  property.name,
                  visit(property.initializer) as ts.Expression
                )
              }
            }
            return property
          })

          // If the property wasn't found, add it
          if (!foundProperty) {
            const newProperty = ts.factory.createPropertyAssignment(
              propertyName,
              propertyValue
            )
            newProperties.push(newProperty)
          }

          return ts.factory.createObjectLiteralExpression(newProperties, true)
        }

        return ts.visitEachChild(node, visit, ctx)
      }

      return visit
    }

    // function addAuthCollectionVisitor(ctx: ts.TransformationContext, authCollection: ts.Expression) {
    //   const visit: ts.Visitor = (node) => {
    //     if (ts.isObjectLiteralExpression(node)) {
    //       let newProperties = node.properties.map(property => {
    //         if (ts.isPropertyAssignment(property)) {
    //           let thisPropertyName = property.name.getText(sourceFile);
    //           // console.log(thisPropertyName)
    //           if (thisPropertyName === 'schema') {
    //             return ts.factory.updatePropertyAssignment(
    //               property,
    //               property.name,
    //               ts.factory.createArrayLiteralExpression([authCollection])
    //             )
    //           }
    //         }
    //       })
    //
    //       return ts.factory.createObjectLiteralExpression(newProperties, true)
    //     }
    //
    //     return ts.visitEachChild(node, visit, ctx);
    //   }
    //   return visit
    // }

    function addExpressionToCollection(
      ctx: ts.TransformationContext,
      newExpression: ts.Expression
    ) {
      const visit: ts.Visitor = (node) => {
        if (ts.isObjectLiteralExpression(node)) {
          console.log('is object literal expression')
          let newProperties = node.properties.map((property) => {
            console.log(
              ts.isPropertyAssignment(property),
              property.name.getText(sourceFile)
            )
            // Check if the property assignment is 'schema'
            if (
              ts.isPropertyAssignment(property) &&
              property.name.getText(sourceFile) === 'schema' &&
              ts.isObjectLiteralExpression(property.initializer)
            ) {
              console.log('found schema!')

              // Create a new 'schema' property with updated initializer
              return ts.factory.updatePropertyAssignment(
                property,
                property.name,
                ts.factory.createObjectLiteralExpression(
                  // Map each 'schema' property
                  property.initializer.properties.map((subProp) => {
                    console.log(subProp.name.getText(sourceFile))
                    // Look for the 'collection' property
                    if (
                      ts.isPropertyAssignment(subProp) &&
                      subProp.name.getText(sourceFile) === 'collections' &&
                      ts.isArrayLiteralExpression(subProp.initializer)
                    ) {
                      if (
                        subProp.initializer.elements.some(
                          (e) =>
                            ts.isIdentifier(e) &&
                            ts.isIdentifier(newExpression) &&
                            e.text === newExpression.text
                        )
                      ) {
                        return subProp //return existing subProp if newExpression already exists
                      }

                      // Create a new 'collection' property with the extra item
                      return ts.factory.updatePropertyAssignment(
                        subProp,
                        subProp.name,
                        ts.factory.createArrayLiteralExpression(
                          [...subProp.initializer.elements, newExpression],
                          true
                        )
                      )
                    }
                    return subProp
                  }),
                  true
                )
              )
            }
            return property
          })

          return ts.factory.updateObjectLiteralExpression(node, newProperties)
        }

        return ts.visitEachChild(node, visit, ctx)
      }

      return visit
    }

    // function createTransformer(propertyName: string, propertyValue: ts.Expression): ts.TransformerFactory<ts.SourceFile> {
    //   return (ctx: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    //     return (sourceFile: ts.SourceFile) => ts.visitNode(sourceFile, createVisitor(ctx, propertyName, propertyValue));
    //   };
    // }
    function createTransformer(
      propertyName: string,
      propertyValue: ts.Expression,
      createVisitor: (
        ctx: ts.TransformationContext,
        propertyName: string,
        propertyValue: ts.Expression
      ) => ts.Visitor
    ): ts.TransformerFactory<ts.ObjectLiteralExpression> {
      return (
        ctx: ts.TransformationContext
      ): ts.Transformer<ts.ObjectLiteralExpression> => {
        return (sourceFile: ts.ObjectLiteralExpression) =>
          ts.visitNode(
            sourceFile,
            createVisitor(ctx, propertyName, propertyValue)
          )
      }
    }

    function updateConfig(
      sourceFile: ts.SourceFile,
      functionName: string,
      newArg: ts.ObjectLiteralExpression
    ): ts.SourceFile {
      let found = false

      const transformer: ts.TransformerFactory<ts.SourceFile> = (
        context: ts.TransformationContext
      ) => {
        const visit: ts.Visitor = (node) => {
          if (
            !found &&
            ts.isCallExpression(node) &&
            ts.isIdentifier(node.expression) &&
            node.expression.text === functionName
          ) {
            found = true
            const newCall = ts.factory.updateCallExpression(
              node,
              node.expression,
              node.typeArguments,
              [newArg, ...node.arguments.slice(1)]
            )
            return newCall
          }
          // Pass the transformation context to visitEachChild
          return ts.visitEachChild(node, visit, context)
        }

        return (node) => ts.visitNode(node, visit)
      }

      const result = ts.transform(sourceFile, [transformer])
      return result.transformed[0] as ts.SourceFile
    }

    function parseExpression(expression: string): ts.Expression {
      const sourceFile = ts.createSourceFile(
        'temp.ts',
        expression,
        ts.ScriptTarget.Latest
      )
      if (sourceFile.statements.length !== 1) {
        throw new Error('Expected one statement')
      }

      const statement = sourceFile.statements[0]
      if (!ts.isExpressionStatement(statement)) {
        throw new Error('Expected an expression statement')
      }

      return statement.expression
    }

    function importTransformer<T extends ts.Node>(
      importMap: Record<string, string[]>
    ): ts.TransformerFactory<T> {
      return (ctx) => {
        const visit: ts.Visitor = (node) => {
          if (ts.isSourceFile(node)) {
            let newStatements = [...node.statements]
            let changed = false

            // Iterate over each module-import pair in the map
            for (const [moduleName, imports] of Object.entries(importMap)) {
              let foundImportStatement = false

              // iterate over the existing import statements
              for (const statement of newStatements) {
                if (
                  ts.isImportDeclaration(statement) &&
                  ts.isStringLiteral(statement.moduleSpecifier) &&
                  statement.moduleSpecifier.text === moduleName
                ) {
                  foundImportStatement = true

                  // Extract already imported modules
                  const existingImports =
                    statement.importClause?.namedBindings &&
                    ts.isNamedImports(statement.importClause.namedBindings)
                      ? statement.importClause.namedBindings.elements.map(
                          (e) => e.name.text
                        )
                      : []

                  const newImports = [
                    ...new Set([
                      // we use Set to remove duplicates
                      ...existingImports,
                      ...imports,
                    ]),
                  ]

                  // Create new import specifiers
                  const importSpecifiers = newImports.map((i) =>
                    ts.factory.createImportSpecifier(
                      undefined,
                      ts.factory.createIdentifier(i)
                    )
                  )
                  const namedImports =
                    ts.factory.createNamedImports(importSpecifiers)

                  // Create new import clause
                  const importClause = ts.factory.createImportClause(
                    false,
                    undefined,
                    namedImports
                  )

                  // Create new import declarations
                  const importDec = ts.factory.createImportDeclaration(
                    undefined,
                    undefined,
                    importClause,
                    ts.factory.createStringLiteral(moduleName)
                  )

                  // replace the import statement with the updated one
                  newStatements[newStatements.indexOf(statement)] = importDec

                  changed = true
                }
              }

              // If the import statement was not found, add a new one
              if (!foundImportStatement) {
                const importSpecifiers = imports.map((i) =>
                  ts.factory.createImportSpecifier(
                    undefined,
                    ts.factory.createIdentifier(i)
                  )
                )
                const namedImports =
                  ts.factory.createNamedImports(importSpecifiers)
                const importClause = ts.factory.createImportClause(
                  false,
                  undefined,
                  namedImports
                )
                const importDec = ts.factory.createImportDeclaration(
                  undefined,
                  undefined,
                  importClause,
                  ts.factory.createStringLiteral(moduleName)
                )
                newStatements.unshift(importDec)

                changed = true
              }
            }

            if (changed) {
              return ts.factory.updateSourceFile(node, newStatements)
            }
          }

          return ts.visitEachChild(node, visit, ctx)
        }

        return (node) => ts.visitNode(node, visit)
      }
    }
    let configDefinition = findFirstObjectLiteralArgument(
      sourceFile,
      'defineStaticConfig'
    )
    // console.log(configDefinition)
    let updatedConfig = ts.transform(configDefinition, [
      createTransformer(
        'contentApiUrlOverride',
        parseExpression('"http://localhost:4001"'),
        createVisitor
      ),
      createTransformer(
        'authProvider2',
        parseExpression('new LocalAuthProvider()'),
        createVisitor
      ),
    ])
    updatedConfig = ts.transform(updatedConfig.transformed[0], [
      (
          ctx: ts.TransformationContext
        ): ts.Transformer<ts.ObjectLiteralExpression> =>
        (sourceFile: ts.ObjectLiteralExpression) =>
          ts.visitNode(
            sourceFile,
            addExpressionToCollection(
              ctx,
              parseExpression('TinaUserCollection')
            )
          ),
    ])
    let transformedSourceFile = updateConfig(
      sourceFile,
      'defineStaticConfig',
      updatedConfig.transformed[0] as ts.ObjectLiteralExpression
    )
    const importTransformResult = ts.transform(transformedSourceFile, [
      importTransformer({
        'tinacms-authjs/dist/tinacms': [
          'TinaUserCollection',
          'UsernamePasswordAuthJSProvider',
        ],
      }),
    ])
    transformedSourceFile = importTransformResult
      .transformed[0] as ts.SourceFile
    // let transformedSourceFile = result.transformed[0] as ts.SourceFile
    let printer = ts.createPrinter({ omitTrailingSemicolon: true })
    let newSourceCode = printer.printFile(transformedSourceFile)
    console.log(newSourceCode)
  }

  async execute(): Promise<number | void> {
    const configManager = new ConfigManager({
      rootPath: this.rootPath,
      legacyNoSDK: this.noSDK,
    })
    logger.info('Starting Tina Dev Server')
    this.logDeprecationWarnings()

    // Initialize the host TCP server
    createDBServer(Number(this.datalayerPort))

    let database: Database = null

    const setup = async ({ firstTime }: { firstTime: boolean }) => {
      try {
        await configManager.processConfig()
        try {
          await this.processConfig(configManager)
        } catch (e) {
          console.log(e)
        }
        if (firstTime) {
          database = await createAndInitializeDatabase(
            configManager,
            Number(this.datalayerPort)
          )
        } else {
          database.clearCache()
        }

        const { tinaSchema, graphQLSchema, lookup, queryDoc, fragDoc } =
          await buildSchema(configManager.config)

        const codegen = new Codegen({
          isLocal: true,
          configManager: configManager,
          port: Number(this.port),
          queryDoc,
          fragDoc,
          graphqlSchemaDoc: graphQLSchema,
          tinaSchema,
          lookup,
        })
        const apiURL = await codegen.execute()

        if (!configManager.isUsingLegacyFolder) {
          delete require.cache[configManager.generatedSchemaJSONPath]
          delete require.cache[configManager.generatedLookupJSONPath]
          delete require.cache[configManager.generatedGraphQLJSONPath]

          const schemaObject = require(configManager.generatedSchemaJSONPath)
          const lookupObject = require(configManager.generatedLookupJSONPath)
          const graphqlSchemaObject = require(configManager.generatedGraphQLJSONPath)
          await fs.writeFileSync(
            path.join(configManager.tinaFolderPath, 'tina-lock.json'),
            JSON.stringify({
              schema: schemaObject,
              lookup: lookupObject,
              graphql: graphqlSchemaObject,
            })
          )
        }

        if (!this.noWatch) {
          this.watchQueries(configManager, async () => await codegen.execute())
        }

        await this.indexContentWithSpinner({
          database,
          graphQLSchema,
          tinaSchema,
          configManager,
        })
        if (!firstTime) {
          logger.error('Re-index complete')
        }
        return { apiURL, database, graphQLSchema, tinaSchema }
      } catch (e) {
        logger.error(dangerText(e.message))
        if (this.verbose) {
          console.error(e)
        }
        if (firstTime) {
          logger.error(
            warnText(
              'Unable to start dev server, please fix your Tina config and try again'
            )
          )
          process.exit(1)
        } else {
          logger.error(warnText('Dev server has not been restarted'))
        }
      }
    }
    const { apiURL, graphQLSchema, tinaSchema } = await setup({
      firstTime: true,
    })

    await fs.outputFile(configManager.outputHTMLFilePath, devHTML(this.port))
    // Add the gitignore so the index.html and assets are committed to git
    await fs.outputFile(
      configManager.outputGitignorePath,
      'index.html\nassets/'
    )
    const searchIndexClient = new LocalSearchIndexClient({
      stopwordLanguages: configManager.config.search?.tina?.stopwordLanguages,
      tokenSplitRegex: configManager.config.search?.tina?.tokenSplitRegex,
    })
    await searchIndexClient.onStartIndexing()

    const server = await createDevServer(
      configManager,
      database,
      searchIndexClient.searchIndex,
      apiURL,
      this.noWatch
    )
    await server.listen(Number(this.port))
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
    })

    if (configManager.config.search) {
      await spin({
        waitFor: async () => {
          await searchIndexer.indexAllContent()
        },
        text: 'Building search index',
      })

      if (this.outputSearchIndexPath) {
        await searchIndexClient.export(this.outputSearchIndexPath)
      }
    }

    if (!this.noWatch) {
      this.watchContentFiles(
        configManager,
        database,
        configManager.config.search && searchIndexer
      )
      chokidar.watch(configManager.watchList).on('change', async () => {
        logger.info(`Tina config change detected, rebuilding`)
        await setup({ firstTime: false })
        // The setup process results in an update to the prebuild file
        // But Vite doesn't reload when it's changed for some reason
        // So we're triggering the reload ourselves
        server.ws.send({ type: 'full-reload', path: '*' })
      })
    }

    const subItems = []

    if (configManager.hasSeparateContentRoot()) {
      subItems.push({
        key: 'Content repo',
        value: configManager.contentRootPath,
      })
    }

    const summaryItems = [
      {
        emoji: '🦙',
        heading: 'Tina Config',
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
    ]

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
      })
    }

    summary({
      heading: 'Tina Dev Server is running...',
      items: [
        ...summaryItems,
        // {
        //   emoji: '📚',
        //   heading: 'Useful links',
        //   subItems: [
        //     {
        //       key: 'Custom queries',
        //       value: 'https://tina.io/querying',
        //     },
        //     {
        //       key: 'Visual editing',
        //       value: 'https://tina.io/visual-editing',
        //     },
        //   ],
        // },
      ],
    })
    await this.startSubCommand()
  }

  watchContentFiles(
    configManager: ConfigManager,
    database: Database,
    searchIndexer?: SearchIndexer
  ) {
    const collectionContentFiles = []
    configManager.config.schema.collections.forEach((collection) => {
      const collectionGlob = `${path.join(
        configManager.contentRootPath,
        collection.path
      )}/**/*.${collection.format || 'md'}`
      collectionContentFiles.push(collectionGlob)
    })
    let ready = false
    /**
     * This has no way of knowing whether the change to the file came from someone manually
     * editing in their IDE or Tina pushing the update via the Filesystem bridge. It's a simple
     * enough update that it's fine that when Tina pushes a change, we go and push that same
     * thing back through the database, and Tina Cloud does the same thing when it receives
     * a push from Github.
     */
    chokidar
      .watch(collectionContentFiles)
      .on('ready', () => {
        ready = true
      })
      .on('add', async (addedFile) => {
        if (!ready) {
          return
        }
        const pathFromRoot = configManager.printContentRelativePath(addedFile)
        await database.indexContentByPaths([pathFromRoot]).catch(console.error)
        if (searchIndexer) {
          await searchIndexer
            .indexContentByPaths([pathFromRoot])
            .catch(console.error)
        }
      })
      .on('change', async (changedFile) => {
        const pathFromRoot = configManager.printContentRelativePath(changedFile)
        // Optionally we can reload the page when this happens
        // server.ws.send({ type: 'full-reload', path: '*' })
        await database.indexContentByPaths([pathFromRoot]).catch(console.error)
        if (searchIndexer) {
          await searchIndexer
            .indexContentByPaths([pathFromRoot])
            .catch(console.error)
        }
      })
      .on('unlink', async (removedFile) => {
        const pathFromRoot = configManager.printContentRelativePath(removedFile)
        await database.deleteContentByPaths([pathFromRoot]).catch(console.error)
        if (searchIndexer) {
          await searchIndexer
            .deleteIndexContent([pathFromRoot])
            .catch(console.error)
        }
      })
  }
  watchQueries(configManager: ConfigManager, callback: () => Promise<string>) {
    let ready = false
    /**
     * This has no way of knowing whether the change to the file came from someone manually
     * editing in their IDE or Tina pushing the update via the Filesystem bridge. It's a simple
     * enough update that it's fine that when Tina pushes a change, we go and push that same
     * thing back through the database, and Tina Cloud does the same thing when it receives
     * a push from Github.
     */
    chokidar
      .watch(configManager.userQueriesAndFragmentsGlob)
      .on('ready', () => {
        ready = true
      })
      .on('add', async (addedFile) => {
        await callback()
      })
      .on('change', async (changedFile) => {
        await callback()
      })
      .on('unlink', async (removedFile) => {
        await callback()
      })
  }
}
