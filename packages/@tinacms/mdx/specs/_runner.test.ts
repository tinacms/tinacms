import { expect, it } from 'vitest'
import type { RichTypeInner } from '@tinacms/schema-tools'
import prettier from 'prettier'
import type { BlockElement } from '../src/parse/plate'
import { parseMDX } from '../src/parse/index'
import { stringifyMDX } from '../src/stringify'
import fs from 'fs'
import path from 'path'

export { BlockElement }

export const print = (ast) =>
  prettier.format(
    `import type { BlockElement } from "./runner.test"

const output: BlockElement[] = ${JSON.stringify(ast)}
export { output }
`,
    {
      parser: 'babel-ts',
      singleQuote: true,
      semi: false,
    }
  )

export const output = (value: BlockElement[]) => value

export const field: RichTypeInner = {
  name: 'body',
  type: 'rich-text',
  templates: [
    {
      name: 'Greeting',
      label: 'Greeting',
      inline: true,
      fields: [{ type: 'string', name: 'message' }],
    },
  ],
}

export const parseThenStringify = (
  string,
  field,
  parseImageCallback?: any,
  stringifyImageCallback?: any
) => {
  const parseCallback = parseImageCallback || ((url) => url)
  const stringifyCallback = stringifyImageCallback || ((url) => url)
  const astResult = parseMDX(string, field, parseCallback)
  // Trim newlines for readability
  const stringResult = stringifyMDX(astResult, field, stringifyCallback).trim()
  // Only care about the children
  return { astResult: print(astResult.children), stringResult }
}

const content = import.meta.glob('./*.md', { as: 'raw' })
const outputString = import.meta.glob('./*.ts', { as: 'raw' })

Object.entries(content).map(([filename, value]) => {
  const string = outputString[filename.replace('.md', '.ts')]
  it(filename, () => {
    const { astResult, stringResult } = parseThenStringify(value, field)
    expect(stringResult).toEqual(value.trim())
    if (string) {
      expect(string).toEqual(astResult)
    } else {
      fs.writeFile(
        path.join('.', 'specs', filename.replace('.md', '.ts')),
        astResult,
        (error) => {
          console.log(error)
        }
      )
    }
  })
})
