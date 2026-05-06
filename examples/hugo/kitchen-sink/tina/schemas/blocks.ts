/**
 * Block schemas — extracted from the Next.js version's React component files.
 * Hugo can't import from React components, so schemas live here.
 */
import { actionsFieldSchema, colorFieldSchema } from './shared-fields';
import { iconSchema } from './icon';

export const heroBlockSchema = {
  name: 'hero',
  label: 'Hero',
  ui: {
    previewSrc: '/blocks/hero.png',
    defaultItem: {
      tagline: "Here's some text above the other text",
      headline: 'This Big Text is Totally Awesome',
      text: 'Phasellus scelerisque, libero eu finibus rutrum, risus risus accumsan libero, nec molestie urna dui a leo.',
    },
  },
  fields: [
    {
      type: 'string' as const,
      label: 'Tagline',
      name: 'tagline',
    },
    {
      type: 'string' as const,
      label: 'Headline',
      name: 'headline',
    },
    {
      label: 'Text',
      name: 'text',
      type: 'string' as const,
      ui: {
        component: 'textarea',
      },
    },
    {
      type: 'object' as const,
      label: 'Image',
      name: 'image',
      fields: [
        {
          type: 'string' as const,
          label: 'Source',
          name: 'src',
          ui: {
            component: 'image',
          },
        },
        {
          type: 'string' as const,
          label: 'Alt Text',
          name: 'alt',
        },
      ],
    },
    actionsFieldSchema,
    colorFieldSchema,
  ],
};

export const featureBlockSchema = {
  name: 'features',
  label: 'Features',
  ui: {
    previewSrc: '/blocks/features.png',
    defaultItem: {
      title: 'Features',
      items: [],
    },
  },
  fields: [
    {
      type: 'string' as const,
      label: 'Title',
      name: 'title',
    },
    {
      type: 'string' as const,
      ui: {
        component: 'textarea',
      },
      label: 'Description',
      name: 'description',
    },
    {
      type: 'object' as const,
      label: 'Feature Items',
      name: 'items',
      list: true,
      ui: {
        itemProps: (item: Record<string, unknown>) => {
          return {
            label: typeof item === 'string' ? item : item?.title,
          };
        },
        defaultItem: 'New Feature',
      },
      fields: [
        iconSchema,
        {
          type: 'string' as const,
          label: 'Title',
          name: 'title',
        },
        {
          type: 'string' as const,
          label: 'Text',
          name: 'text',
          ui: {
            component: 'textarea',
          },
        },
        actionsFieldSchema,
      ],
    },
    colorFieldSchema,
  ],
};

export const ctaBlockSchema = {
  name: 'cta',
  label: 'CTA',
  ui: {
    previewSrc: '/blocks/cta.png',
  },
  fields: [
    {
      type: 'string' as const,
      label: 'Title',
      name: 'title',
    },
    {
      type: 'string' as const,
      ui: {
        component: 'textarea',
      },
      label: 'Description',
      name: 'description',
    },
    actionsFieldSchema,
    colorFieldSchema,
  ],
};

export const testimonialBlockSchema = {
  name: 'testimonial',
  label: 'Testimonial',
  ui: {
    previewSrc: '/blocks/testimonial.png',
    defaultItem: {
      quote:
        'There are only two hard things in Computer Science: cache invalidation and naming things.',
      author: 'Phil Karlton',
      color: 'primary',
    },
  },
  fields: [
    {
      type: 'string' as const,
      ui: {
        component: 'textarea',
      },
      label: 'Quote',
      name: 'quote',
    },
    {
      type: 'string' as const,
      label: 'Author',
      name: 'author',
    },
    colorFieldSchema,
  ],
};

export const contentBlockSchema = {
  name: 'content',
  label: 'Content',
  ui: {
    defaultItem: {
      body: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat mattis eros. Nullam malesuada erat ut turpis. Suspendisse urna nibh, viverra non, semper suscipit, posuere a, pede.',
    },
  },
  fields: [
    {
      type: 'rich-text' as const,
      label: 'Body',
      name: 'body',
    },
    colorFieldSchema,
  ],
};
