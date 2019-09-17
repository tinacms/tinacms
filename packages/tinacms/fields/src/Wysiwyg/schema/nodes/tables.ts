import { tableNodes } from "prosemirror-tables"

const tables = tableNodes({
  tableGroup: "block",
  cellContent: "inline*",
  cellAttributes: {},
})

tables.table_cell = {
  ...tables.table_cell,
  marks: "_",
  attrs: { ...tables.table_cell.attrs, align: { default: null } },
} as any
tables.table_header = {
  ...tables.table_header,
  marks: "_",
  attrs: { ...tables.table_header.attrs, align: { default: null } },
} as any

export { tables }
