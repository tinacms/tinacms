import { tableNodes } from 'prosemirror-tables'
import { SchemaNodePlugin } from '../..'

const tables = tableNodes({
  tableGroup: 'block',
  cellContent: 'inline*',
  cellAttributes: {},
})

tables.table_cell = {
  ...tables.table_cell,
  marks: '_',
  attrs: { ...tables.table_cell.attrs, align: { default: null } },
} as any
tables.table_header = {
  ...tables.table_header,
  marks: '_',
  attrs: { ...tables.table_header.attrs, align: { default: null } },
} as any

export { tables }

const plugins: SchemaNodePlugin[] = Object.keys(tables).map(name => ({
  __type: 'wysiwyg:schema:node',
  name,
  node: (tables as any)[name],
}))

export default plugins
