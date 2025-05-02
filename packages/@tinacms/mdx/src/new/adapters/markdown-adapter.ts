//Handles Markdown-specific transformations
import { fromMarkdown as mdastFromMarkdown } from 'mdast-util-from-markdown'
import { RichTextField } from '@tinacms/schema-tools'
import * as acorn from 'acorn'
import { gfm } from 'micromark-extension-gfm'
import { gfmFromMarkdown } from 'mdast-util-gfm'
import { mdxJsx, Options } from '../conversion'
import { ShortCodeAdapter } from './shortcode-adapter'
import { mdxJsxFromMarkdown } from '../conversion/shortcodes/mdast'

export const MarkdownAdapter = {
  toAst: fromMarkdown,
}

function fromMarkdown(value: string, field: RichTextField) {
  const patterns = ShortCodeAdapter.get(field)
  const acornDefault = acorn as unknown as Options['acorn']
  const skipHTML = false

  const tree = mdastFromMarkdown(value, {
    extensions: [
      gfm(),
      mdxJsx({ acorn: acornDefault, patterns, addResult: true, skipHTML }),
    ],
    mdastExtensions: [gfmFromMarkdown(), mdxJsxFromMarkdown({ patterns })],
  })

  return tree
}
