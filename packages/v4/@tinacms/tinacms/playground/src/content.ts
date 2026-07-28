import type { TinaDocument } from '@tinacms/tinacms';

// Static seed for /preview.html opened standalone. `satisfies`, not an
// annotation: useTina is generic, so keeping the literal shape lets the preview
// read `body` as the mdx AST instead of casting it back out of `unknown`.
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
