import ts from 'typescript'
import { Config } from '../prompts'
import { GeneratedFile } from '../index'
import fs from 'fs-extra'
import {
  makeTransformer,
  parseExpression,
  parseVariableStatement,
} from './util'

/**
 * Takes in a source file, variable statement source file, and a variable statement, and returns a custom transformation visitor.
 * The visitor will traverse the AST and perform the necessary transformations on variable statements.
 *
 * The variable statement will be inserted after the last import statement in the source file.
 *
 * @param {ts.SourceFile} sourceFile - The source file being transformed.
 * @param {ts.SourceFile} variableStmtSourceFile - The source file of the variable statement.
 * @param {ts.VariableStatement} variableStmt - The variable statement to be inserted.
 * @returns {ts.TransformerFactory<ts.SourceFile>} A transformation factory that produces a transformation visitor.
 */
const makeVariableStatementVisitor =
  (
    sourceFile: ts.SourceFile,
    variableStmtSourceFile: ts.SourceFile,
    variableStmt: ts.VariableStatement
  ): ts.TransformerFactory<ts.SourceFile> =>
  (ctx: ts.TransformationContext) =>
  (node) => {
    if (ts.isSourceFile(node)) {
      const newStatements = [...node.statements]
      let encounteredImports = false
      let firstNonImportStatementIdx = -1
      let existingStatementIdx = -1
      const [newVarDec] = variableStmt.declarationList.declarations
      const newVarDecName = newVarDec.name.getText(variableStmtSourceFile)
      for (let i = 0; i < newStatements.length; i++) {
        const isImport = ts.isImportDeclaration(newStatements[i])
        if (isImport && !encounteredImports) {
          encounteredImports = true
        }
        if (
          !isImport &&
          encounteredImports &&
          firstNonImportStatementIdx === -1
        ) {
          firstNonImportStatementIdx = i
        }
        const stmt = newStatements[i]
        if (ts.isVariableStatement(stmt)) {
          const [dec] = stmt.declarationList.declarations
          if (
            dec.name &&
            ts.isIdentifier(dec.name) &&
            dec.name.getText(sourceFile) === newVarDecName
          ) {
            existingStatementIdx = i
          }
        }

        if (existingStatementIdx !== -1 && firstNonImportStatementIdx !== -1) {
          break
        }
      }
      if (firstNonImportStatementIdx === -1) {
        firstNonImportStatementIdx = 0
      }

      if (existingStatementIdx === -1) {
        newStatements.splice(firstNonImportStatementIdx, 0, variableStmt)
      }
      return ts.factory.updateSourceFile(node, newStatements)
    }
  }

/**
 * A function that creates a TypeScript transformation visitor for making imports in a source file.
 *
 * @param sourceFile - The source file to transform.
 * @param importMap - A map of module names to arrays of import names.
 * @returns A TypeScript transformation visitor function.
 */
const makeImportsVisitor =
  (sourceFile: ts.SourceFile, importMap: Record<string, string[]>) =>
  (ctx: ts.TransformationContext) =>
  (node: ts.Node) => {
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
            const namedImports = ts.factory.createNamedImports(importSpecifiers)

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
          const namedImports = ts.factory.createNamedImports(importSpecifiers)
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
  }

/**
 * A transformation visitor function that adds an expression to a schema collection.
 *
 * @param {ts.SourceFile} sourceFile - The source file containing the original code.
 * @param {string} functionName - The name of the function to modify.
 * @param {ts.SourceFile} newExpressionSourceFile - The source file containing the new expression to add.
 * @param {ts.Expression} newExpression - The new expression to add to the schema collection.
 * @returns {ts.TransformerFactory<ts.SourceFile>} - A transformer factory that performs the transformation.
 */
const makeAddExpressionToSchemaCollectionVisitor =
  (
    sourceFile: ts.SourceFile,
    functionName: string,
    newExpressionSourceFile: ts.SourceFile,
    newExpression: ts.Expression
  ): ts.TransformerFactory<ts.SourceFile> =>
  (ctx: ts.TransformationContext) => {
    const visit = (node: ts.Node) => {
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === functionName &&
        node.arguments.length > 0 &&
        ts.isObjectLiteralExpression(node.arguments[0])
      ) {
        const configObject = node.arguments[0] as ts.ObjectLiteralExpression
        // Map the properties of the first argument
        const updateProperties = configObject.properties.map((property) => {
          if (ts.isPropertyAssignment(property)) {
            const thisPropertyName = property.name.getText(sourceFile)
            if (
              thisPropertyName === 'schema' &&
              ts.isPropertyAssignment(property) &&
              ts.isObjectLiteralExpression(property.initializer)
            ) {
              const schemaObject =
                property.initializer as ts.ObjectLiteralExpression
              const collectionsProperty = schemaObject.properties.find(
                (p) =>
                  ts.isPropertyAssignment(p) &&
                  p.name.getText(sourceFile) === 'collections'
              )
              if (
                collectionsProperty &&
                ts.isPropertyAssignment(collectionsProperty) &&
                ts.isArrayLiteralExpression(collectionsProperty.initializer)
              ) {
                const collectionsArray =
                  collectionsProperty.initializer as ts.ArrayLiteralExpression
                const collectionItems = collectionsArray.elements.map((e) =>
                  e.getText(sourceFile)
                )
                if (
                  collectionItems.includes(
                    newExpression.getText(newExpressionSourceFile)
                  )
                ) {
                  return property
                }
                return ts.factory.updatePropertyAssignment(
                  property,
                  property.name,
                  ts.factory.createObjectLiteralExpression(
                    schemaObject.properties.map((subProp) => {
                      if (
                        ts.isPropertyAssignment(subProp) &&
                        subProp.name.getText(sourceFile) === 'collections' &&
                        ts.isArrayLiteralExpression(subProp.initializer)
                      ) {
                        return ts.factory.updatePropertyAssignment(
                          subProp,
                          subProp.name,
                          ts.factory.createArrayLiteralExpression(
                            [newExpression, ...subProp.initializer.elements],
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
            }
          }
          return property
        })

        return ts.factory.createCallExpression(
          node.expression,
          node.typeArguments,
          [ts.factory.createObjectLiteralExpression(updateProperties, true)]
        )
      }

      return ts.visitEachChild(node, visit, ctx)
    }
    return visit
  }

/**
 * Creates a TypeScript transformation visitor that updates an object literal property of a given function call.
 *
 * @param {ts.SourceFile} sourceFile - The source file containing the function call.
 * @param {string} functionName - The name of the function to update.
 * @param {string} propertyName - The name of the property to update.
 * @param {ts.SourceFile} propertyValueExpressionSourceFile - The source file containing the expression for the new property value.
 * @param {ts.Expression} propertyValue - The new property value.
 *
 * @returns {ts.TransformerFactory<ts.SourceFile>} The transformation visitor.
 */
const makeUpdateObjectLiteralPropertyVisitor =
  (
    sourceFile: ts.SourceFile,
    functionName: string,
    propertyName: string,
    propertyValueExpressionSourceFile: ts.SourceFile,
    propertyValue: ts.Expression
  ): ts.TransformerFactory<ts.SourceFile> =>
  (ctx: ts.TransformationContext) => {
    const visitor = (node: ts.Node) => {
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === functionName &&
        node.arguments.length > 0 &&
        ts.isObjectLiteralExpression(node.arguments[0])
      ) {
        let foundProperty = false
        const configObject = node.arguments[0] as ts.ObjectLiteralExpression
        // Map the properties of the first argument
        const updateProperties = configObject.properties.map((property) => {
          if (
            ts.isPropertyAssignment(property) ||
            ts.isShorthandPropertyAssignment(property)
          ) {
            const name = property.name.getText(sourceFile)
            if (name === propertyName) {
              foundProperty = true
              return ts.factory.createPropertyAssignment(name, propertyValue)
            }
          }
          return property
        })

        // If the property wasn't found, add it
        if (!foundProperty) {
          updateProperties.unshift(
            ts.factory.createPropertyAssignment(propertyName, propertyValue)
          )
        }

        return ts.factory.createCallExpression(
          node.expression,
          node.typeArguments,
          [ts.factory.createObjectLiteralExpression(updateProperties, true)]
        ) as ts.Node
      }

      return ts.visitEachChild(node, visitor, ctx)
    }
    return visitor
  }

export const addSelfHostedTinaAuthToConfig = async (
  config: Config,
  configFile: GeneratedFile
) => {
  const pathToConfig = configFile.resolve(config.typescript).path
  const sourceFile = ts.createSourceFile(
    pathToConfig,
    fs.readFileSync(pathToConfig, 'utf8'),
    config.typescript ? ts.ScriptTarget.Latest : ts.ScriptTarget.ESNext
  )
  const { configImports, configAuthProviderClass, extraTinaCollections } =
    config.authProvider

  const importMap: Record<string, string[]> = {
    // iterate over configImports and add them to the import map
    ...configImports.reduce((acc, { from, imported }) => {
      acc[from] = imported
      return acc
    }, {} as Record<string, string[]>),
  }

  const transformedSourceFileResult = ts.transform(
    sourceFile,
    [
      makeImportsVisitor(sourceFile, {
        ...importMap,
        tinacms: ['LocalAuthProvider'],
      }),
      makeVariableStatementVisitor(
        sourceFile,
        ...parseVariableStatement(
          "const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true'"
        )
      ),
      makeUpdateObjectLiteralPropertyVisitor(
        sourceFile,
        'defineConfig',
        'authProvider',
        ...parseExpression(
          `isLocal ? new LocalAuthProvider() : ${configAuthProviderClass}`
        )
      ),
      makeUpdateObjectLiteralPropertyVisitor(
        sourceFile,
        'defineConfig',
        'contentApiUrlOverride',
        ...parseExpression("'/api/tina/gql'")
      ),
      ...extraTinaCollections.map((collectionName) =>
        makeAddExpressionToSchemaCollectionVisitor(
          sourceFile,
          'defineConfig',
          ...parseExpression(collectionName)
        )
      ),
    ].map((visitor) => makeTransformer(visitor))
  )
  return fs.writeFile(
    pathToConfig,
    ts
      .createPrinter({ omitTrailingSemicolon: true })
      .printFile(transformedSourceFileResult.transformed[0] as ts.SourceFile)
  )
}
