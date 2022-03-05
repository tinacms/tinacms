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
import { TinaCMS } from '@tinacms/toolkit'
import { optimizeDocuments } from '@graphql-tools/relay-operation-optimizer'
import { toMatchFile } from 'jest-file-snapshot'
import path from 'path'
import 'isomorphic-fetch'
import * as G from 'graphql'
import { LocalClient } from '../../../client'

// @ts-ignore FIXME: jest-types
expect.extend({ toMatchFile })

const tina = new LocalClient()

/**
 * We're just mocking the tina api so we can mimic the real-world getSchema
 */
const cms = new TinaCMS({
  apis: {
    tina: tina,
    tina2: {
      getSchema: async () => {
        // @ts-ignore
        return G.buildASTSchema(graphqlJSON)
      },
      getOptimizedQuery: async (documentNode) => {
        // @ts-ignore
        const schema = G.buildASTSchema(graphqlJSON)
        const [optimizedQuery] = optimizeDocuments(schema, [documentNode], {
          assumeValid: true,
          // Include actually means to keep them as part of the document.
          // We want to merge them into the query so there's a single top-level node
          includeFragments: false,
          noLocation: true,
        })
        return optimizedQuery
      },
    },
  },
})

export const printOutput = (event, previous, after) => {
  const markdown = `Previous
\`\`\`json
${JSON.stringify(previous, null, 2)}
\`\`\`
---

Event (details omitted for brevity)
\`\`\`json
${JSON.stringify(
  {
    type: event.type,
    value: event.value,
    previousValue: event.previousValue,
    mutationType: event.mutationType,
    formId: event.formId,
    field: { name: event.field.name },
  },
  null,
  2
)}
\`\`\`
---

Result
\`\`\`json
${JSON.stringify(after, null, 2)}
\`\`\``

  return markdown
}

import type { State } from '../'
export { printState } from '../util'

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const printOutput2 = async (current: State, event, callback) => {
  const previous = { ...current.data }
  callback()
  await sleep(1000)
  const after = { ...current.data }
  console.log(JSON.stringify(after))

  return printOutput(event, previous, after)
}

export { cms }

export const sequential = async <A, B>(
  items: A[] | undefined,
  callback: (args: A, idx: number) => Promise<B>
) => {
  const accum: B[] = []
  if (!items) {
    return []
  }

  const reducePromises = async (previous: Promise<B>, endpoint: A) => {
    const prev = await previous
    // initial value will be undefined
    if (prev) {
      accum.push(prev)
    }

    return callback(endpoint, accum.length)
  }

  // @ts-ignore FIXME: this can be properly typed
  const result = await items.reduce(reducePromises, Promise.resolve())
  if (result) {
    // @ts-ignore FIXME: this can be properly typed
    accum.push(result)
  }

  return accum
}

export const buildFileOutput = (dirname) => {
  return path.join(dirname, 'snapshots', `query.unit-test.gql`)
}

export const buildMarkdownOutput = (dirname, counter) => {
  return path.join(dirname, 'snapshots', 'events', `${counter}.md`)
}
