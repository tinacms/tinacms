import { contentBlockSchema } from '@/components/blocks/content';
import { ctaBlockSchema } from '@/components/blocks/cta';
import { featureBlockSchema } from '@/components/blocks/features';
import { heroBlockSchema } from '@/components/blocks/hero';
import { testimonialBlockSchema } from '@/components/blocks/testimonial';
import type { Collection } from 'tinacms';

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
    {
      name: 'image',
      label: 'Image',
      type: 'image',
      accept: 'image',
    },
  ],
};

export default Page;
