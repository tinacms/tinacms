import * as fs from 'fs'
import * as path from 'path'
import { defaultSchema } from '../../default-schema'
import { MarkdownTranslator } from './index'

const pathOf = (...files: string[]) => path.resolve(__dirname, ...files)

const flavours = fs.readdirSync(pathOf())

const isDirectory = (...files: string[]) =>
  fs.lstatSync(pathOf(...files)).isDirectory()

describe('Markdown Translators', () => {
  flavours.forEach(flavour => {
    if (flavour !== 'commonmark') {
      return
    }
    const translator = MarkdownTranslator.commonMarkFromSchema(defaultSchema)

    describe(flavour, () => {
      if (!isDirectory(flavour)) {
        return
      }

      const tests = fs.readdirSync(pathOf(flavour, '__tests__'))

      tests.forEach(test => {
        if (test.startsWith('skip_')) {
          return
        }

        if (isDirectory(flavour, '__tests__', test)) {
          testDir(flavour, test)
          return
        }

        testFile(flavour, test)
      })
    })

    function testFile(flavour: string, file: string) {
      const input = fs.readFileSync(pathOf(flavour, '__tests__', file), 'utf8')

      it(file, () => {
        const node = translator.nodeFromString(input)!
        const output = translator.stringFromNode(node)
        expect(output).toBe(input)
      })
    }

    function testDir(flavour: string, dir: string) {
      const readFile = (file: string) =>
        fs.existsSync(pathOf(flavour, '__tests__', dir, file))
          ? fs.readFileSync(pathOf(flavour, '__tests__', dir, file), 'utf8')
          : ''

      const writeFile = (file: string, content: string) =>
        fs.writeFile(pathOf(flavour, '__tests__', dir, file), content, () => {})

      const input = readFile('input.md')
      const expectedNode = readFile('node.json')
      const expectedOutput = readFile('output.md')

      const node = translator.nodeFromString(input)!
      const output = translator.stringFromNode(node)

      describe(dir, () => {
        if (expectedNode) {
          it('PM Node', () => {
            expect(node.toJSON()).toEqual(JSON.parse(expectedNode))
          })
        } else {
          writeFile('node.json', JSON.stringify(node.toJSON(), null, 2))
        }

        if (expectedOutput) {
          it('MD Output', () => {
            expect(output).toBe(expectedOutput)
          })
        } else {
          writeFile('output.md', output)
        }
      })
    }
  })
})
