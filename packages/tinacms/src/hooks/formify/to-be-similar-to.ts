import { ASTNode, parse, DocumentNode, DefinitionNode, print } from 'graphql'
import { compareNodes } from '@graphql-tools/utils'

declare global {
  namespace jest {
    interface Matchers<R, T> {
      /**
       * Normalizes whitespace and performs string comparisons
       */
      toBeSimilarGqlDoc(expected: string): R
    }
  }
}

function sortRecursive(a: ASTNode) {
  for (const attr in a) {
    if (a[attr] instanceof Array) {
      if (a[attr].length === 1) {
        sortRecursive(a[attr][0])
      }
      a[attr].sort((b: ASTNode, c: ASTNode) => {
        sortRecursive(b)
        sortRecursive(c)
        return compareNodes(b, c)
      })
    }
  }
}

function normalizeDocumentString(docStr: string) {
  const doc = parse(docStr, { noLocation: true }) as DocumentNode & {
    definitions: DefinitionNode[]
  }
  sortRecursive(doc)
  return print(doc)
}

expect.extend({
  toBeSimilarGqlDoc(received: string, expected: string) {
    const strippedReceived = normalizeDocumentString(received)
    const strippedExpected = normalizeDocumentString(expected)

    if (strippedReceived.trim() === strippedExpected.trim()) {
      return {
        message: () =>
          `expected
       ${received}
       not to be a string containing (ignoring indents)
       ${expected}`,
        pass: true,
      }
    } else {
      return {
        message: () =>
          `expected
       ${received}
       to be a string containing (ignoring indents)
       ${expected}`,
        pass: false,
      }
    }
  },
})
