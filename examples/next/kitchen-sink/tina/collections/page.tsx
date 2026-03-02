import type { Collection } from 'tinacms';
import { heroBlockSchema } from '@/components/blocks/hero';
import { featureBlockSchema } from '@/components/blocks/features';
import { ctaBlockSchema } from '@/components/blocks/cta';
import { testimonialBlockSchema } from '@/components/blocks/testimonial';
import { contentBlockSchema } from '@/components/blocks/content';

const Page: Collection = {
  label: 'Pages',
  name: 'page',
  path: 'content/pages',
  format: 'mdx',
  ui: {
    router: ({ document }) => {
      const filepath = document._sys.breadcrumbs.join('/');
      if (filepath === 'home') {
        return '/';
      }
      return `/page/${filepath}`;
    },
  },
  fields: [
    {
      type: 'object',
      list: true,
      name: 'blocks',
      label: 'Sections',
      ui: {
        visualSelector: true,
      },
      templates: [
        heroBlockSchema,
        featureBlockSchema,
        ctaBlockSchema,
        testimonialBlockSchema,
        contentBlockSchema,
      ],
    },
  ],
};

export default Page;
