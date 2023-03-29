import { z } from 'zod'
import type * as M from 'mdast'
import type {
  BlockContent,
  PhrasingContent,
  StaticPhrasingContent,
  Heading,
  Text,
  Link,
  Void,
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
} from './types'

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

const voidNode: Void = { children: [{ type: 'text', text: '' }] }

const PhrasingContentSchema: z.ZodType<
  PhrasingContent[],
  z.ZodTypeDef,
  M.PhrasingContent[]
> = z
  .array(
    z.lazy(() =>
      z.union([LinkReferenceSchema, LinkSchema, StaticPhrasingContentSchema])
    )
  )
  .transform((items) => {
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
            accumulator.push({ type: 'break', ...voidNode })
            break
          case 'emphasis':
            flattenMdPhrasingContent(item.children, accumulator, {
              ...marks,
              emphasis: true,
            })
            break
          case 'footnoteReference':
            accumulator.push({ ...item, ...voidNode })
            break
          case 'html':
            accumulator.push({ type: 'html', value: item.value, ...voidNode })
            break
          case 'image':
            accumulator.push({ ...item, ...voidNode })
            break
          case 'imageReference':
            accumulator.push({ ...item, ...voidNode })
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

const HeadingSchema: z.ZodType<Heading, z.ZodTypeDef, M.Heading> = z.object({
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
const DefinitionSchema: z.ZodType<Definition, z.ZodTypeDef, M.Definition> = z
  .object({
    type: z.literal('definition'),
    identifier: z.string(),
    url: z.string(),
  })
  .transform((item) => {
    return {
      ...item,
      ...voidNode,
    }
  })
const ThematicBreakSchema: z.ZodType<
  ThematicBreak,
  z.ZodTypeDef,
  M.ThematicBreak
> = z
  .object({
    type: z.literal('thematicBreak'),
  })
  .transform((item) => {
    return {
      ...item,
      ...voidNode,
    }
  })
const TransformedHTMLSchema: z.ZodType<HTML, z.ZodTypeDef, M.HTML> = z
  .object({
    type: z.literal('html'),
    value: z.string(),
  })
  .transform((item) => {
    return {
      ...item,
      ...voidNode,
    }
  })
const FootnoteDefinitionSchema: z.ZodType<
  FootnoteDefinition,
  z.ZodTypeDef,
  M.FootnoteDefinition
> = z.object({
  type: z.literal('footnoteDefinition'),
  identifier: z.string(),
  label: z.string().optional().nullable(),
  children: z.lazy(() => BlockContentSchema),
})

const ListItemSchema: z.ZodType<ListItem, z.ZodTypeDef, M.ListItem> = z.object({
  type: z.literal('listItem'),
  checked: z.boolean().optional().nullable(),
  spreak: z.boolean().optional().nullable(),
  children: z.lazy(() =>
    z.union([BlockContentSchema, DefinitionContentSchema])
  ),
})

const CodeSchema: z.ZodType<Code, z.ZodTypeDef, M.Code> = z
  .object({
    type: z.literal('code'),
    lang: z.string().optional().nullable(),
    meta: z.string().optional().nullable(),
    value: z.string(),
  })
  .transform((item) => {
    return {
      ...item,
      ...voidNode,
    }
  })

const ListSchema: z.ZodType<List, z.ZodTypeDef, M.List> = z.object({
  type: z.literal('list'),
  ordered: z.boolean().optional().nullable(),
  start: z.number().optional().nullable(),
  spread: z.boolean().optional().nullable(),
  children: z.array(ListItemSchema),
})

export const DefinitionContentSchema: z.ZodType<
  DefinitionContent[],
  z.ZodTypeDef,
  M.DefinitionContent[]
> = z.array(z.lazy(() => z.union([DefinitionSchema, FootnoteDefinitionSchema])))

export const TableCellSchema: z.ZodType<TableCell, z.ZodTypeDef, M.TableCell> =
  z.object({
    type: z.literal('tableCell'),
    children: PhrasingContentSchema,
  })
export const TableRowSchema: z.ZodType<TableRow, z.ZodTypeDef, M.TableRow> =
  z.object({
    type: z.literal('tableRow'),
    children: z.array(TableCellSchema),
  })

export const TableSchema: z.ZodType<Table, z.ZodTypeDef, M.Table> = z.object({
  type: z.literal('table'),
  align: z
    .array(z.enum(['left', 'right', 'center']))
    .optional()
    .nullable(),
  children: z.array(TableRowSchema),
})

export const BlockContentSchema: z.ZodType<
  BlockContent[],
  z.ZodTypeDef,
  M.BlockContent[]
> = z.array(
  z.lazy(() =>
    z.union([
      HeadingSchema,
      BlockQuoteSchema,
      CodeSchema,
      ParagraphSchema,
      TableSchema,
      ListSchema,
      TransformedHTMLSchema,
      ThematicBreakSchema,
    ])
  )
)

export const TopLevelContentSchema: z.ZodType<
  TopLevelContent[],
  z.ZodTypeDef,
  M.TopLevelContent[]
> = z.array(
  z.lazy(() =>
    z.union([
      HeadingSchema,
      BlockQuoteSchema,
      CodeSchema,
      ParagraphSchema,
      ListSchema,
      TableSchema,
      TransformedHTMLSchema,
      ThematicBreakSchema,
      DefinitionSchema,
      FootnoteDefinitionSchema,
    ])
  )
)

export const SlateRoot = z.object({
  type: z.literal('root'),
  children: TopLevelContentSchema,
})

export type SlateElementType = ReturnType<
  typeof SlateRoot.parse
>['children'][number]
