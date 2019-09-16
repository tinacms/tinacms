/**
 * horizontal_rule
 */
export const horizontal_rule = {
  group: 'block',
  allowGapCursor: true,
  parseDOM: [{ tag: 'hr' }],
  toDOM() {
    return ['hr']
  },
}
