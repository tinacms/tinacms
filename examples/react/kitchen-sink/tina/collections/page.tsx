import type { Collection } from 'tinacms';
import { heroBlockSchema } from '@/src/components/blocks/hero';
import { featureBlockSchema } from '@/src/components/blocks/features';
import { ctaBlockSchema } from '@/src/components/blocks/cta';
import { testimonialBlockSchema } from '@/src/components/blocks/testimonial';
import { contentBlockSchema } from '@/src/components/blocks/content';

const Page: Collection = {
  label: 'Pages',
  name: 'page',
  path: 'content/pages',
  format: 'md',
  ui: {
    router: ({
      document,
    }: { document: { _sys: { filename: string; breadcrumbs: string[] } } }) => {
      const filepath = document._sys.breadcrumbs.join('/');
      if (filepath === 'home') {
        return '/';
      }
      return `/${filepath}`;
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
