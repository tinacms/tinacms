'use client';
import { Section, Container, useLayout } from '../layout';
import { colorFieldSchema } from '@/tina/schemas/shared-fields';
import { authorColorMap } from '@/lib/utils';

interface TestimonialProps {
  data: Record<string, unknown>;
  parentField?: string;
}

export const Testimonial = ({ data, parentField = '' }: TestimonialProps) => {
  const { theme } = useLayout();
  const authorColor = authorColorMap[theme.color] ?? authorColorMap.orange;

  return (
    <Section color={data.color}>
      <Container size='large'>
        <blockquote>
          <div
            className={`relative z-10 max-w-3xl mx-auto text-4xl lg:text-5xl font-bold tracking-normal text-center title-font ${
              data.color === 'primary'
                ? `text-white`
                : `text-gray-700 dark:text-gray-50`
            }`}
          >
            <span
              className={`block opacity-15 text-8xl absolute inset-y-1/2 transform translate-y-2 -left-4 leading-4 -z-1`}
            >
              &ldquo;
            </span>
            <p
              data-tinafield={`${parentField}.quote`}
              className='relative opacity-95'
            >
              {data.quote}
            </p>
            <span
              className={`block opacity-15 text-8xl absolute inset-y-1/2 transform translate-y-3 -right-4 leading-4 -z-1`}
            >
              &rdquo;
            </span>
          </div>
          <div className={`my-8 flex-grow-0`}>
            <span
              className={`block mx-auto h-0.5 w-1/6 ${
                data.color === 'primary'
                  ? `bg-white/30`
                  : `bg-gray-200 dark:bg-gray-700`
              }`}
            ></span>
          </div>
          <footer className='text-center'>
            <p
              data-tinafield={`${parentField}.author`}
              className={`tracking-wide title-font font-bold text-lg ${
                data.color === 'primary' ? `text-white/80` : authorColor
              }`}
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
