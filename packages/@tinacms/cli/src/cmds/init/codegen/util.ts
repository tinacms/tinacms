import ts from 'typescript'

export const makeTransformer =
  <T extends ts.Node>(
    makeVisitor: (ctx: ts.TransformationContext) => ts.Visitor
  ): ts.TransformerFactory<T> =>
  (ctx: ts.TransformationContext) =>
  (node) =>
    ts.visitNode(node, makeVisitor(ctx))

export function parseExpression(
  expression: string
): [ts.SourceFile, ts.Expression] {
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

  return [sourceFile, statement.expression]
}

export function parseVariableStatement(
  stmt: string
): [ts.SourceFile, ts.VariableStatement] {
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    stmt,
    ts.ScriptTarget.Latest
  )
  if (sourceFile.statements.length !== 1) {
    throw new Error('Expected one statement')
  }

  const statement = sourceFile.statements[0]
  if (!ts.isVariableStatement(statement)) {
    throw new Error('Expected a variable statement')
  }

  return [sourceFile, statement]
}
