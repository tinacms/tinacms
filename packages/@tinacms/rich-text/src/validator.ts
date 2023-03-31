import { z } from 'zod'
import type {
  LexicalHorizontalruleNode,
  LexicalPhrasingContentNode,
  LexicalStaticPhrasingContentNode,
  LexicalTopLevelContent,
} from './types'

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

const LexicalTextSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
  format: z.number(),
})
export type LexicalTextSchemaType = z.infer<typeof LexicalTextSchema>

const LexicalLinebreakSchema = z.object({
  type: z.literal('linebreak'),
})

const LexicalStaticPhrasingContentSchema: z.ZodType<LexicalStaticPhrasingContentNode> =
  z.discriminatedUnion('type', [LexicalTextSchema, LexicalLinebreakSchema], {
    errorMap,
  })
export type LexicalStaticPhrasingContentSchemaType = z.infer<
  typeof LexicalStaticPhrasingContentSchema
>

const LexicalLinkSchema = z.object({
  type: z.literal('link'),
  url: z.string(),
  target: z.string().optional().nullable(),
  rel: z.string().optional().nullable(),
  children: z.array(LexicalStaticPhrasingContentSchema),
})

const LexicalPhrasingContentSchema: z.ZodType<LexicalPhrasingContentNode> =
  z.discriminatedUnion(
    'type',
    [LexicalTextSchema, LexicalLinebreakSchema, LexicalLinkSchema],
    { errorMap }
  )
export type LexicalPhrasingContentSchemaType = z.infer<
  typeof LexicalPhrasingContentSchema
>

const LexicalHeadingSchema = z.object({
  type: z.literal('tina-heading'),
  tag: z.enum(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']),
  children: z.array(LexicalPhrasingContentSchema),
  // children: PhrasingContentArraySchema,
})

const LexicalParagraphSchema = z.object({
  type: z.literal('tina-paragraph'),
  children: z.array(LexicalPhrasingContentSchema),
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
  children: z.array(LexicalPhrasingContentSchema),
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
export type LexicalTopLevelContentSchemaType = z.infer<
  typeof LexicalTopLevelContentSchema
>

export const LexicalRootSchema = z.object({
  type: z.literal('root'),
  children: z.array(LexicalTopLevelContentSchema),
})
export type LexicalRootSchemaType = z.infer<typeof LexicalRootSchema>
