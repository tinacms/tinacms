// Handles Slate-specific transformations (e.g., remarkToSlate)
import { RichTextField } from '@tinacms/schema-tools'
import { RichTextParseError } from '../utils/errors'
import { contentHandlers } from './plate'
import { Context, Md, Plate } from './plate/types'
import type { MdxJsxTextElement, MdxJsxFlowElement } from 'mdast-util-mdx-jsx'
import type { ContainerDirective } from 'mdast-util-directive'

export const PlateAdapter = {
  toPlate: remarkToSlate,
}

function remarkToSlate(
  root: Md.Root | MdxJsxFlowElement | MdxJsxTextElement | ContainerDirective,
  field: RichTextField,
  raw?: string,
  skipMDXProcess?: boolean,
  context?: Record<string, unknown>
): Plate.RootElement {
  const sharedContext: Context = { field, raw, context }

  const content = (content: Md.Content): Plate.BlockElement => {
    const handler = contentHandlers[content.type] || contentHandlers.default
    return handler(content, sharedContext)
  }

  return {
    type: 'root',
    children: root.children.map(content),
  }
}
