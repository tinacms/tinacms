/**
 * hard_break
 */
export const hard_break = {
  inline: true,
  group: 'inline',
  selectable: false,
  parseDOM: [{ tag: 'br' }],
  toDOM() {
    return ['br']
  },
}
