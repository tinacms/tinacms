import type { TinaDocument } from '@tinacms/tinacms';

export const sampleDocument = {
  title: 'Hello World',
  featured: false,
  body: {
    type: 'root',
    children: [
      {
        type: 'p',
        children: [{ type: 'text', text: 'Body prose, edited as markdown.' }],
      },
    ],
  },
} satisfies TinaDocument;
