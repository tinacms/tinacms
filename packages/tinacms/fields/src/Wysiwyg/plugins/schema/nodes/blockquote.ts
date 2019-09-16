export const blockquote = {
  content: 'block+',
  group: 'block',
  defining: true,
  parseDOM: [{ tag: 'blockquote' }],
  toDOM() {
    return ['blockquote', 0]
  },
}

export default {
  name: 'blockquote',
  node: blockquote,
}
