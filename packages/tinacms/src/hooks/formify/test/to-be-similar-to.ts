/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { ASTNode, parse, DocumentNode, DefinitionNode, print } from 'graphql'
import { compareNodes } from '@graphql-tools/utils'

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
