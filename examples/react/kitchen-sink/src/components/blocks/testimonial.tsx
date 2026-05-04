import React from 'react';
import { Section, Container } from '../layout';
import { tinaField } from 'tinacms/dist/react';
import { colorFieldSchema } from '@/tina/schemas/shared-fields';
import { cn } from '@/src/lib/utils';
import type { PageBlocksTestimonial } from '@/tina/__generated__/types';

interface TestimonialProps {
  data: PageBlocksTestimonial;
}

export const Testimonial = ({ data }: TestimonialProps) => {
  const isPrimary = data.color === 'primary';

  return (
    <Section color={data.color}>
      <Container size='large'>
        <blockquote>
          <div
            className={cn(
              'relative z-10 max-w-3xl mx-auto text-4xl lg:text-5xl font-bold tracking-normal text-center title-font',
              isPrimary ? 'text-white' : 'text-gray-700 dark:text-gray-50'
            )}
          >
            <span className='block opacity-15 text-8xl absolute inset-y-1/2 transform translate-y-2 -left-4 leading-4 -z-1'>
              &ldquo;
            </span>
            <p
              data-tina-field={tinaField(data, 'quote')}
              className='relative opacity-95'
            >
              {data.quote}
            </p>
            <span className='block opacity-15 text-8xl absolute inset-y-1/2 transform translate-y-3 -right-4 leading-4 -z-1'>
              &rdquo;
            </span>
          </div>
          <div className='my-8 flex-grow-0'>
            <span
              className={cn(
                'block mx-auto h-0.5 w-1/6',
                isPrimary ? 'bg-white/30' : 'bg-gray-200 dark:bg-gray-700'
              )}
            />
          </div>
          <footer className='text-center'>
            <p
              data-tina-field={tinaField(data, 'author')}
              className={cn(
                'tracking-wide title-font font-bold text-lg',
                isPrimary
                  ? 'text-white/80'
                  : 'text-theme-500 dark:text-theme-300'
              )}
            >
              {data.author}
            </p>
          </footer>
        </blockquote>
      </Container>
    </Section>
  );
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
      type: 'string',
      ui: {
        component: 'textarea',
      },
      label: 'Quote',
      name: 'quote',
    },
    {
      type: 'string',
      label: 'Author',
      name: 'author',
    },
    colorFieldSchema,
  ],
};
