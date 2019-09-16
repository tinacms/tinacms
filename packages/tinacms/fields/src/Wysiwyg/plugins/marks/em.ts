/**
 * Emphasis
 */
export default {
  name: 'em',
  mark: {
    parseDOM: [
      { tag: 'i' },
      { tag: 'em' },
      {
        style: 'font-style',
        // @ts-ignore
        getAttrs: (value: string): string => value == 'italic' && null,
      },
    ],
    toDOM() {
      return ['em']
    },
  },
}
