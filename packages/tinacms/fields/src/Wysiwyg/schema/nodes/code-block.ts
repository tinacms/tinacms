/**
 * code_block
 */
export const code_block = {
  content: 'text*',
  attrs: { params: { default: '' } },
  group: 'block',
  code: true,
  defining: true,
  parseDOM: [{ tag: 'pre', preserveWhitespace: 'full' }],
  toDOM() {
    return ['pre', ['code', 0]]
  },
}
