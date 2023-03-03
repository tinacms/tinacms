import { RichTextField } from '@tinacms/schema-tools'

export const field: RichTextField = {
  name: 'body',
  type: 'rich-text',
  parser: { type: 'markdown' },
  templates: [
    {
      name: 'RecentPosts',
      label: 'Recent Posts',
      match: { start: '[', end: ']', name: 'recent-posts' },
      fields: [{ name: 'posts', type: 'string' }],
    },
  ],
}
