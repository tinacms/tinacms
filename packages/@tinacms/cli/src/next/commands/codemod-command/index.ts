import { Command, Option } from 'clipanion'
import { logger } from '../../../logger'
import { ConfigManager } from '../../config-manager'
import fs from 'fs-extra'
import path from 'path'
import ts from 'typescript'

const updateTinaConfig = async (configManager: ConfigManager) => {
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
            // // Recursively handle nested object properties
            // if (ts.isObjectLiteralExpression(property.initializer)) {
            //   return ts.factory.updatePropertyAssignment(
            //     property,
            //     property.name,
            //     visit(property.initializer) as ts.Expression
            //   );
            // }
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

  function addExpressionToCollection(
    ctx: ts.TransformationContext,
    newExpression: ts.Expression
  ) {
    const visit: ts.Visitor = (node) => {
      if (ts.isObjectLiteralExpression(node)) {
        let newProperties = node.properties.map((property) => {
          // Check if the property assignment is 'schema'
          if (
            ts.isPropertyAssignment(property) &&
            property.name.getText(sourceFile) === 'schema' &&
            ts.isObjectLiteralExpression(property.initializer)
          ) {
            // Create a new 'schema' property with updated initializer
            return ts.factory.updatePropertyAssignment(
              property,
              property.name,
              ts.factory.createObjectLiteralExpression(
                // Map each 'schema' property
                property.initializer.properties.map((subProp) => {
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
    'defineConfig'
  ) // todo defineStaticConfig!
  if (!configDefinition) {
    throw new Error('Could not find config definition')
  }
  let updatedConfig = ts.transform(configDefinition, [
    createTransformer(
      'authProvider',
      parseExpression(
        'isLocal ? new LocalAuthProvider() : new UsernamePasswordAuthJSProvider()'
      ),
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
          addExpressionToCollection(ctx, parseExpression('TinaUserCollection'))
        ),
  ])
  let transformedSourceFile = updateConfig(
    sourceFile,
    'defineConfig',
    updatedConfig.transformed[0] as ts.ObjectLiteralExpression
  )
  const importTransformResult = ts.transform(transformedSourceFile, [
    importTransformer({
      'tinacms-authjs/dist/tinacms': [
        'TinaUserCollection',
        'UsernamePasswordAuthJSProvider',
      ],
      tinacms: ['LocalAuthProvider'],
    }),
  ])
  transformedSourceFile = importTransformResult.transformed[0] as ts.SourceFile
  // let transformedSourceFile = result.transformed[0] as ts.SourceFile
  let printer = ts.createPrinter({ omitTrailingSemicolon: true })
  return printer.printFile(transformedSourceFile)
}

export class CodemodCommand extends Command {
  static paths = [
    ['codemod'],
    ['codemod', 'move-tina-folder'],
    ['codemod', 'enable-tina-auth'],
  ]
  rootPath = Option.String('--rootPath', {
    description: 'Specify the root directory to run the CLI from',
  })
  verbose = Option.Boolean('-v,--verbose', false, {
    description: 'increase verbosity of logged output',
  })
  static usage = Command.Usage({
    category: `Commands`,
    description: `Use codemods for various Tina tasks`,
  })

  async catch(error: any): Promise<void> {
    console.log(error)
    // logger.error('Error occured during tinacms codemod')
    // process.exit(1)
  }

  async execute(): Promise<number | void> {
    const mod = this.path[1]
    if (!mod) {
      logger.error(
        "Must specify an additional argument (eg. 'move-tina-folder')"
      )
      process.exit(1)
    }
    const mods = {
      'move-tina-folder': () => moveTinaFolder(this.rootPath),
      'enable-tina-auth': () => enableTinaAuth(this.rootPath),
    }
    const command = mods[mod]
    if (!command) {
      logger.error(`Mod not found for ${mod}`)
      process.exit(1)
    }
    await command()
  }
}
const moveTinaFolder = async (rootPath: string = process.cwd()) => {
  const configManager = new ConfigManager({ rootPath })
  try {
    await configManager.processConfig()
  } catch (e) {
    logger.error(e.message)
    process.exit(1)
  }

  const tinaDestination = path.join(configManager.rootPath, 'tina')
  if (await fs.existsSync(tinaDestination)) {
    logger.info(
      `Folder already exists at ${tinaDestination}. Either delete this folder to complete the codemod, or ensure you have properly copied your config from the ".tina" folder.`
    )
  } else {
    await fs.moveSync(configManager.tinaFolderPath, tinaDestination)
    await writeGitignore(configManager.rootPath)
    logger.info(
      "Move to 'tina' folder complete. Be sure to update any imports of the autogenerated client!"
    )
  }
}

const enableTinaAuth = async (rootPath: string = process.cwd()) => {
  const configManager = new ConfigManager({ rootPath })
  try {
    await configManager.processConfig()
  } catch (e) {
    logger.error(e.message)
    process.exit(1)
  }
  const result = await updateTinaConfig(configManager)
  // write the result to the file
  fs.writeFileSync(configManager.tinaConfigFilePath, result)
}

export const writeGitignore = async (rootPath: string) => {
  fs.outputFileSync(path.join(rootPath, 'tina', '.gitignore'), '__generated__')
}
