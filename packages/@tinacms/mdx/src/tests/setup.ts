import type { RichTypeInner } from '@tinacms/schema-tools'
import prettier from 'prettier'
import type { BlockElement, RootElement } from '../parse/plate'
import { parseMDX } from '../parse/index'
import fs from 'fs'
import path from 'path'

export type { BlockElement, RichTypeInner }

export const output = (object: RootElement) => object

export const print = (ast: object, name: string, autoformatted?: boolean) =>
  prettier.format(
    `
import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from '${name}?raw'
${
  autoformatted &&
  `import markdownStringFormatted from '${name.replace(
    '.md',
    '.autoformat.md'
  )}?raw'`
}

const out = output(${JSON.stringify(ast)})

describe("${name}", () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(${
      autoformatted ? 'markdownStringFormatted' : 'markdownString'
    })
  })
})
`,
    {
      parser: 'babel-ts',
      singleQuote: true,
      semi: false,
    }
  )

export const run = (
  dirname: string,
  content: any,
  outputString: any,
  field: RichTypeInner
) => {
  Object.entries(content).forEach(([name, content]) => {
    if (typeof content !== 'string') {
      throw new Error('Expected glob import to be a string')
    }
    const tsFilename = name.replace('.md', '.test.ts')
    if (!outputString[tsFilename]) {
      const astResult = parseMDX(content, field, (v) => v)
      fs.writeFile(
        path.join(dirname, tsFilename),
        print(astResult, name),
        (err) => {
          if (err) {
            throw err
          }
        }
      )
    }
  })
}

type GlobFile = Record<string, () => Promise<string>>

export const setupNewTests = (
  markdownContentFiles: GlobFile,
  testFiles: GlobFile,
  callback: (newTests: {
    name: string
    markdownContent: () => Promise<string>
  }) => void
) => {
  const newTests: { name: string; markdownContent: () => Promise<string> }[] =
    []
  Object.entries(markdownContentFiles).forEach(([name, markdownContent]) => {
    const testFilename = name.replace('.md', '.test.ts')
    if (!testFiles[testFilename]) {
      newTests.push({ name, markdownContent })
    }
  })
  newTests.forEach((testInfo) => callback(testInfo))
}

export const runInner = (
  name: string,
  dirname: string,
  content: string,
  outputString: Record<string, string>,
  field: RichTypeInner
) => {
  const tsFilename = name.replace('.md', '.test.ts')
  if (!outputString[tsFilename]) {
    const astResult = parseMDX(content, field, (v) => v)
    fs.writeFile(
      path.join(dirname, tsFilename),
      print(astResult, name),
      (err) => {
        if (err) {
          throw err
        }
      }
    )
  }
}

export const writeTestFile = (
  dirname: string,
  name: string,
  astResult: object,
  autoformatted?: boolean
) => {
  const tsFilename = name.replace('.md', '.test.ts')
  fs.writeFile(
    path.join(dirname, tsFilename),
    print(astResult, name, autoformatted),
    (err) => {
      if (err) {
        throw err
      }
    }
  )
}

export const writeAutoformatFile = (
  dirname: string,
  name: string,
  stringResult: string
) => {
  const filename = name.replace('.md', '.autoformat.md')
  fs.writeFile(path.join(dirname, filename), stringResult, (err) => {
    if (err) {
      throw err
    }
  })
}
