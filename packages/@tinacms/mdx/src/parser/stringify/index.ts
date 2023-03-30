import { toMarkdown } from 'mdast-util-to-markdown'
import { gfm } from 'micromark-extension-gfm'
import { gfmToMarkdown } from 'mdast-util-gfm'
import { z } from 'zod'
import type * as M from 'mdast'
import type {
  BlockContent,
  PhrasingContent,
  StaticPhrasingContent,
  Heading,
  Text,
  Definition,
  FootnoteDefinition,
  TopLevelContent,
  DefinitionContent,
  HTML,
  ThematicBreak,
  List,
  ListItem,
  Code,
  Table,
  TableRow,
  TableCell,
} from '../types'

const InlineCodeSchema: z.ZodType<M.InlineCode> = z.object({
  type: z.literal('inlineCode'),
  value: z.string(),
})
const TextSchema: z.ZodType<M.Text> = z.object({
  type: z.literal('text'),
  value: z.string(),
})
const HTMLSchema: z.ZodType<M.HTML> = z.object({
  type: z.literal('html'),
  value: z.string(),
})
const BreakSchema: z.ZodType<M.Break> = z.object({
  type: z.literal('break'),
})
const ImageSchema: z.ZodType<M.Image> = z.object({
  type: z.literal('image'),
  url: z.string(),
  title: z.string().optional().nullable(),
  alt: z.string().optional().nullable(),
})
const ImageReferenceSchema: z.ZodType<M.ImageReference> = z.object({
  type: z.literal('imageReference'),
  alt: z.string().optional().nullable(),
  referenceType: z.enum(['shortcut', 'collapsed', 'full']),
  identifier: z.string(),
  label: z.string().optional().nullable(),
})
const FootnoteReferenceSchema: z.ZodType<M.FootnoteReference> = z.object({
  type: z.literal('footnoteReference'),
  identifier: z.string(),
  label: z.string().optional().nullable(),
})
const StrongSchema: z.ZodType<M.Strong> = z.object({
  type: z.literal('strong'),
  children: z.lazy(() => UntransformedPhrasingContentSchema),
})
const EmphasisSchema: z.ZodType<M.Emphasis> = z.object({
  type: z.literal('emphasis'),
  children: z.lazy(() => UntransformedPhrasingContentSchema),
})
const DeleteSchema: z.ZodType<M.Delete> = z.object({
  type: z.literal('delete'),
  children: z.lazy(() => UntransformedPhrasingContentSchema),
})
const StaticPhrasingContentSchema: z.ZodType<M.StaticPhrasingContent> = z.union(
  [
    TextSchema,
    EmphasisSchema,
    StrongSchema,
    ImageSchema,
    ImageReferenceSchema,
    BreakSchema,
    HTMLSchema,
    InlineCodeSchema,
    FootnoteReferenceSchema,
    DeleteSchema,
  ]
)
const LinkSchema: z.ZodType<M.Link> = z.object({
  type: z.literal('link'),
  url: z.string(),
  title: z.string().optional().nullable(),
  children: z.array(StaticPhrasingContentSchema),
})
const LinkReferenceSchema: z.ZodType<M.LinkReference> = z.object({
  type: z.literal('linkReference'),
  referenceType: z.enum(['shortcut', 'collapsed', 'full']),
  identifier: z.string(),
  label: z.string().optional().nullable(),
  children: z.array(StaticPhrasingContentSchema),
})
const UntransformedPhrasingContentSchema: z.ZodType<M.PhrasingContent[]> =
  z.array(
    z.lazy(() =>
      z.union([LinkSchema, LinkReferenceSchema, StaticPhrasingContentSchema])
    )
  )

const PhrasingContentSchema: z.ZodType<
  M.PhrasingContent[],
  z.ZodTypeDef,
  PhrasingContent[]
> = z
  .array(
    z.lazy(() =>
      z.union([LinkReferenceSchema, LinkSchema, StaticPhrasingContentSchema])
    )
  )
  .transform((items) => {
    console.log(items)

    return items.map((item) => {
      if (item.type === 'text') {
        return { type: 'text', value: item.value }
      }
    })

    const flattenMdStaticPhrasingContent = (
      items: M.StaticPhrasingContent[],
      accumulator: StaticPhrasingContent[] = [],
      parentMarks: Partial<Text>
    ): void => {
      return flattenMdPhrasingContent(items, accumulator, parentMarks)
    }
    const flattenMdPhrasingContent = (
      items: M.PhrasingContent[],
      accumulator: PhrasingContent[] = [],
      parentMarks: Partial<Text>
    ): void => {
      const marks: Partial<Text> = parentMarks
      items.forEach((item) => {
        switch (item.type) {
          case 'footnote':
            /**
             * It doesn't actually seem like this is supported. But
             * the spec says that this is a footnote:
             *
             * ^[alpha bravo]
             *
             * And it's picked up as as paragraph element so not sure
             */
            console.warn(`Not implemented ${item.type}`)
            break
          case 'delete':
            flattenMdPhrasingContent(item.children, accumulator, {
              ...marks,
              delete: true,
            })
            break
          case 'inlineCode':
            accumulator.push({ type: 'text', text: item.value, code: true })
            break
          case 'break':
            accumulator.push({ type: 'break' })
            break
          case 'emphasis':
            flattenMdPhrasingContent(item.children, accumulator, {
              ...marks,
              emphasis: true,
            })
            break
          case 'footnoteReference':
            accumulator.push(item)
            break
          case 'html':
            accumulator.push({ type: 'html', value: item.value })
            break
          case 'image':
            accumulator.push(item)
            break
          case 'imageReference':
            accumulator.push(item)
            break
          case 'linkReference':
            {
              const linkChildren: Text[] = []
              flattenMdStaticPhrasingContent(item.children, linkChildren, marks)
              accumulator.push({
                ...item,
                children: linkChildren,
              })
            }
            break
          case 'link':
            const linkChildren: Text[] = []
            flattenMdStaticPhrasingContent(item.children, linkChildren, marks)
            accumulator.push({
              ...item,
              children: linkChildren,
            })
            break
          case 'text':
            accumulator.push({ type: 'text', text: item.value, ...marks })
            break
          case 'strong':
            flattenMdPhrasingContent(item.children, accumulator, {
              ...marks,
              strong: true,
            })
            break
        }
      })
    }

    const accumulator: PhrasingContent[] = []
    flattenMdPhrasingContent(items, accumulator, {})
    return accumulator
  })

const HeadingSchema: z.ZodType<M.Heading, z.ZodTypeDef, Heading> = z.object({
  type: z.literal('heading'),
  depth: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
  ]),
  children: PhrasingContentSchema,
})

const ParagraphSchema = z.object({
  type: z.literal('paragraph'),
  children: PhrasingContentSchema,
})
const BlockQuoteSchema = z.object({
  type: z.literal('blockquote'),
  children: z.lazy(() => BlockContentSchema),
})
const DefinitionSchema: z.ZodType<M.Definition, z.ZodTypeDef, Definition> =
  z.object({
    type: z.literal('definition'),
    identifier: z.string(),
    url: z.string(),
  })

const ThematicBreakSchema: z.ZodType<
  M.ThematicBreak,
  z.ZodTypeDef,
  ThematicBreak
> = z.object({
  type: z.literal('thematicBreak'),
})

const FootnoteDefinitionSchema: z.ZodType<
  M.FootnoteDefinition,
  z.ZodTypeDef,
  FootnoteDefinition
> = z.object({
  type: z.literal('footnoteDefinition'),
  identifier: z.string(),
  label: z.string().optional().nullable(),
  children: z.lazy(() => BlockContentSchema),
})

const ListItemSchema: z.ZodType<M.ListItem, z.ZodTypeDef, ListItem> = z.object({
  type: z.literal('listItem'),
  checked: z.boolean().optional().nullable(),
  spreak: z.boolean().optional().nullable(),
  children: z.lazy(() =>
    z.union([BlockContentSchema, DefinitionContentSchema])
  ),
})

const CodeSchema: z.ZodType<M.Code, z.ZodTypeDef, Code> = z.object({
  type: z.literal('code'),
  lang: z.string().optional().nullable(),
  meta: z.string().optional().nullable(),
  value: z.string(),
})

const ListSchema: z.ZodType<M.List, z.ZodTypeDef, List> = z.object({
  type: z.literal('list'),
  ordered: z.boolean().optional().nullable(),
  start: z.number().optional().nullable(),
  spread: z.boolean().optional().nullable(),
  children: z.array(ListItemSchema),
})

export const DefinitionContentSchema: z.ZodType<
  M.DefinitionContent[],
  z.ZodTypeDef,
  DefinitionContent[]
> = z.array(z.lazy(() => z.union([DefinitionSchema, FootnoteDefinitionSchema])))

export const TableCellSchema: z.ZodType<M.TableCell, z.ZodTypeDef, TableCell> =
  z.object({
    type: z.literal('tableCell'),
    children: PhrasingContentSchema,
  })
export const TableRowSchema: z.ZodType<M.TableRow, z.ZodTypeDef, TableRow> =
  z.object({
    type: z.literal('tableRow'),
    children: z.array(TableCellSchema),
  })

export const TableSchema: z.ZodType<M.Table, z.ZodTypeDef, Table> = z.object({
  type: z.literal('table'),
  align: z
    .array(z.enum(['left', 'right', 'center']))
    .optional()
    .nullable(),
  children: z.array(TableRowSchema),
})

export const BlockContentSchema: z.ZodType<
  M.BlockContent[],
  z.ZodTypeDef,
  BlockContent[]
> = z.array(
  z.lazy(() =>
    z.union([
      HeadingSchema,
      BlockQuoteSchema,
      CodeSchema,
      ParagraphSchema,
      TableSchema,
      ListSchema,
      HTMLSchema,
      ThematicBreakSchema,
    ])
  )
)

export const TopLevelContentSchema: z.ZodType<
  M.TopLevelContent[],
  z.ZodTypeDef,
  TopLevelContent[]
> = z.array(
  z.lazy(() =>
    z.union([
      HeadingSchema,
      BlockQuoteSchema,
      CodeSchema,
      ParagraphSchema,
      ListSchema,
      TableSchema,
      HTMLSchema,
      ThematicBreakSchema,
      DefinitionSchema,
      FootnoteDefinitionSchema,
    ])
  )
)

export const LexicalRoot = z.object({
  type: z.literal('root'),
  children: TopLevelContentSchema,
})

export const stringifyMDX = (ast: {
  type: 'root'
  children: TopLevelContent[]
}) => {
  const mdast = LexicalRoot.safeParse(ast)

  if (mdast.success) {
    const string = toMarkdown(mdast.data, {
      extensions: [gfmToMarkdown()],
    })
    return string
  } else {
    console.dir(mdast.error.format(), { depth: null })
  }
}
