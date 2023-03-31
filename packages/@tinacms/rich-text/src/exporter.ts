import type { SerializedEditorState, SerializedLexicalNode } from 'lexical'
import type { PhrasingContent, Root } from 'mdast'
import { z } from 'zod'
import type {
  LexicalHorizontalruleNode,
  LexicalPhrasingContentNode,
  LexicalStaticPhrasingContentNode,
  LexicalTopLevelContent,
} from './types'
// import { stringifyMDX } from '@tinacms/mdx'

const errorMap: z.ZodErrorMap = (issue, ctx): { message: string } => {
  // Add a better error message for invalid_union_discriminator
  if (issue.code === 'invalid_union_discriminator') {
    return {
      message: `Invalid \`type\` property. In the schema is type: ${
        ctx.data?.type
      }. Expected one of ${issue.options.join(', ')}`,
    }
  }
  return {
    message: issue.message || '',
  }
}

// export const exportToMarkdownAst = (root: SerializedEditorState<SerializedLexicalNode>) => {
export const exportToMarkdownAst = (
  json: SerializedEditorState<SerializedLexicalNode>
) => {
  console.log(json.root)
  const result = LexicalRootSchema.safeParse(json.root)
  if (result.success) {
    console.log(result)
    // const root: Root = {type: 'root', children: []}
    // result.data.children.forEach(child => {
    //   child.
    //   root.children.push()
    // })
    // const string = stringifyMDX(result.data)
    // console.log(string)
  } else {
    console.log(result.error)
  }
}

// Text node formatting
// export const DEFAULT_FORMAT = 0 as const
// export const IS_BOLD = 0b1 as const
// export const IS_ITALIC = 0b10 as const
// export const IS_STRIKETHROUGH = 0b100 as const
// export const IS_UNDERLINE = 0b1000 as const
// export const IS_CODE = 0b10000 as const
// export const IS_SUBSCRIPT = 0b100000 as const
// export const IS_SUPERSCRIPT = 0b1000000 as const
// export const IS_HIGHLIGHT = 0b10000000 as const
const LexicalTextSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
  format: z.number(),
})

const LexicalLinebreakSchema = z.object({
  type: z.literal('linebreak'),
})

const StaticPhrasingContentSchema: z.ZodType<LexicalStaticPhrasingContentNode> =
  z.discriminatedUnion('type', [LexicalTextSchema, LexicalLinebreakSchema], {
    errorMap,
  })

const LexicalLinkSchema = z.object({
  type: z.literal('link'),
  children: z.array(StaticPhrasingContentSchema),
})

const PhrasingContentSchema: z.ZodType<LexicalPhrasingContentNode> =
  z.discriminatedUnion(
    'type',
    [LexicalTextSchema, LexicalLinebreakSchema, LexicalLinkSchema],
    { errorMap }
  )

const PhrasingContentArraySchema: z.ZodType<
  PhrasingContent[],
  z.ZodTypeDef,
  LexicalPhrasingContentNode[]
> = z
  .array(
    z.discriminatedUnion(
      'type',
      [LexicalTextSchema, LexicalLinebreakSchema, LexicalLinkSchema],
      { errorMap }
    )
  )
  .transform((items) => {
    return [{ type: 'text' as const, value: '' }]
  })

const LexicalHeadingSchema = z.object({
  type: z.literal('tina-heading'),
  children: z.array(PhrasingContentSchema),
  // children: PhrasingContentArraySchema,
})

const LexicalParagraphSchema = z.object({
  type: z.literal('tina-paragraph'),
  // children: z.array(PhrasingContentSchema),
  children: z.array(PhrasingContentSchema).transform((items) => {
    console.log(items)
    return items.map((item) => {
      // if (item.type === 'text') {
      //   return {
      //     type: 'text',
      //     value: item.text,
      //   }
      // }
      return item
    })
  }),
})

const LexicalListItemSchema = z.object({
  type: z.literal('tina-listitem'),
  children: z.array(z.lazy(() => LexicalTopLevelContentSchema)),
})

const LexicalListSchema = z.object({
  type: z.literal('list'),
  listType: z.enum(['bullet', 'number']),
  children: z.array(LexicalListItemSchema),
})

const LexicalQuoteSchema = z.object({
  type: z.literal('tina-quotenode'),
  children: z.array(z.lazy(() => LexicalTopLevelContentSchema)),
})

const LexicalCodeHighlightSchema = z.object({
  type: z.literal('code-highlight'),
  highlightType: z.string().optional().nullable(),
  text: z.string(),
  format: z.number(),
  mode: z.enum(['normal', 'token', 'segmented']),
  style: z.string(),
})

const LexicalCodeSchema = z.object({
  type: z.literal('code'),
  children: z.array(
    z.union([LexicalCodeHighlightSchema, LexicalLinebreakSchema])
  ),
})

const LexicalHorizontalruleNode = z.object({
  type: z.literal('horizontalrule'),
})

const LexicalTableCellSchema = z.object({
  type: z.literal('tablecell'),
  children: z.array(PhrasingContentSchema),
})

const LexicalTableRowSchema = z.object({
  type: z.literal('tablerow'),
  children: z.array(LexicalTableCellSchema),
})

const LexicalTableSchema = z.object({
  type: z.literal('table'),
  children: z.array(LexicalTableRowSchema),
})

const LexicalTopLevelContentSchema: z.ZodType<LexicalTopLevelContent> =
  z.discriminatedUnion(
    'type',
    [
      LexicalParagraphSchema,
      LexicalListSchema,
      LexicalCodeSchema,
      LexicalHorizontalruleNode,
      LexicalQuoteSchema,
      LexicalHeadingSchema,
      LexicalTableSchema,
    ],
    { errorMap }
  )

const LexicalRootSchema = z.object({
  type: z.literal('root'),
  children: z.array(LexicalTopLevelContentSchema),
})
