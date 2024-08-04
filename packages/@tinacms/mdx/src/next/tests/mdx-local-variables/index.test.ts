import { it, expect } from 'vitest'
import { parseMDX } from '../../../parse'
import { stringifyMDX } from '../../../stringify'
import { field } from './field'
import contextMarkdown from './context.md?raw'
import input from './in.md?raw'
import * as util from '../util'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { frontmatter } from 'micromark-extension-frontmatter'
import {
  frontmatterFromMarkdown,
  frontmatterToMarkdown,
} from 'mdast-util-frontmatter'
import yaml from 'js-yaml'
import { toMarkdown } from 'mdast-util-to-markdown'

it('matches input', () => {
  const contextTree = fromMarkdown(contextMarkdown, {
    extensions: [frontmatter(['yaml'])],
    mdastExtensions: [frontmatterFromMarkdown(['yaml'])],
  })
  const frontmatter2 = contextTree.children[0]
  if (frontmatter2?.type !== 'yaml')
    throw new Error('Expected yaml frontmatter')

  const context = yaml.load(frontmatter2.value)

  const tree = parseMDX(input, field, (v) => v, context)
  expect(util.print(tree)).toMatchFile(util.nodePath(__dirname))
  const context2 = {}
  const string = stringifyMDX(tree, field, (v) => v, context2)
  const contextOut = toMarkdown(
    {
      type: 'root',
      children: [{ type: 'yaml', value: yaml.dump(context2).trim() }],
    },
    {
      extensions: [frontmatterToMarkdown(['yaml'])],
    }
  )
  expect(string).toMatchFile(util.mdPath(__dirname))
  expect(contextOut).toMatchFile(util.mdContextPath(__dirname))
})
