export const superscript = {
  parseDOM: [
    { tag: 'sup' },
    {
      style: 'vertical-align',
      getAttrs: (value: string) => value === 'super' && null,
    },
  ],
  toDOM: () => ['sup', 0],
  excludes: 'code',
}
