import type { TinaDocument } from '@tinacms/tinacms';

// The static seed for /preview.html, when a browser opens that page by itself. This uses
// `satisfies`, and not a type annotation. useTina is generic, so the literal shape lets
// the preview read `body` as the MDX tree, and not cast it out of `unknown`.
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
