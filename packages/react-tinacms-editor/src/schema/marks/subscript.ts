export const subscript = {
  parseDOM: [
    { tag: 'sub' },
    {
      style: 'vertical-align',
      getAttrs: (value: string) => value === 'sub' && null,
    },
  ],
  toDOM: () => ['sub', 0],
  excludes: 'code',
}
