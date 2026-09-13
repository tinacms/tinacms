import type { TinaDocument } from '@tinacms/tinacms';

// The static seed for the site page at /, when a browser opens it by itself. A real
// site would render the document it fetched at build time. This uses `satisfies`, not a
// type annotation: useTina is generic, so the literal shape lets the preview read `body`
// as the MDX tree, and not cast it out of `unknown`.
export const sampleDocument = {
  title: 'Hello World',
  featured: false,
  stars: 4,
  authors: [
    {
      name: 'Author Name',
    },
  ],
  status: 'draft',
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
