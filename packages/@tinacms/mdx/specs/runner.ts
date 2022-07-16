import { expect, it } from 'vitest'
import type { RichTypeInner } from '@tinacms/schema-tools'
import prettier from 'prettier'
import type { BlockElement } from '../src/parse/plate'
import { parseMDX } from '../src/parse/index'
import { stringifyMDX } from '../src/stringify'

export { expect, it }

export const print = (ast) =>
  prettier.format(
    `import { output } from "../runner"

export default output(${JSON.stringify(ast)})`,
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
  templates: [],
}

import fs from 'fs'

export const writeSnapshot = (astResult) => {
  fs.writeFile('./specs/basic/out.ts', astResult, (error) => {
    console.log(error)
  })
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
