import { RichTextTemplate } from '@tinacms/schema-tools'
import { stringifyMDX } from '@tinacms/mdx'
import { z } from 'zod'

/**
 * Out-of-the-box template for rendering basic markdown tables
 */
export const tinaTableTemplate: RichTextTemplate = {
  name: 'table',
  label: 'Table',
  fields: [
    {
      name: 'firstRowHeader',
      label: 'First row is a header',
      type: 'boolean',
    },
    {
      name: 'align',
      label: 'Align',
      type: 'string',
      list: true,
      description: 'Possible values: "left", "right", or "center".',
    },
    {
      name: 'tableRows',
      label: 'Rows',
      type: 'object',
      list: true,
      ui: {
        itemProps: (value) => {
          if (value?.tableCells) {
            if (Array.isArray(value.tableCells)) {
              return {
                label: value.tableCells
                  .map((cellItem) => stringifyCell(cellItem.value)?.trim())
                  .join(' | '),
              }
            }
          }
          return { label: 'Row' }
        },
      },
      fields: [
        {
          name: 'tableCells',
          label: 'Table Cells',
          list: true,
          type: 'object',
          ui: {
            itemProps: (cell) => {
              if (cell) {
                if (cell.value) {
                  return {
                    label: stringifyCell(cell.value)?.trim(),
                  }
                }
              }
              return { label: 'Value' }
            },
          },
          fields: [
            {
              label: 'Value',
              description:
                'Note: table cells do not support block-level elements like headers, code blocks, or lists. Any block-level items other than the first paragraph will be considered invalid.',
              name: 'value',
              type: 'rich-text',
              ui: {
                validate(value) {
                  try {
                    tableCellSchema.parse(value)
                  } catch (e) {
                    if (e instanceof z.ZodError) {
                      return e.errors[0].message
                    }
                    return e.message
                  }
                },
              },
            },
          ],
        },
      ],
    },
  ],
}

const tableCellSchema = z.object({
  type: z.literal('root'),
  children: z
    .array(
      z.object({
        type: z.string(),
        children: z.any().array(),
      })
    )
    .refine(
      (value) => {
        const firstValue = value[0]
        return firstValue && firstValue.type === 'p'
      },
      {
        message: `Table cell content cannot contain block elements like headers, blockquotes, or lists.`,
      }
    )
    .refine(
      (value) => {
        if (value.length > 1) {
          const secondBlock = value[1]
          return (
            secondBlock &&
            secondBlock.children.length === 1 &&
            !secondBlock.children[0]?.text
          )
        }
        return true
      },
      {
        message: `Table cells can only have 1 block level element.`,
      }
    ),
})

const stringifyCell = (cell: any) => {
  return stringifyMDX(cell, { name: 'body', type: 'rich-text' }, () => '')
}
