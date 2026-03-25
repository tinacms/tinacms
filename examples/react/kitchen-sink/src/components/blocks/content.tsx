import React from 'react';
import { Section, Container } from '../layout';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import { tinaField } from 'tinacms/dist/react';
import { customComponents } from '@/src/components/markdown-components';
import { cn } from '@/src/lib/utils';
import { colorFieldSchema } from '@/tina/schemas/shared-fields';
import type { PageBlocksContent } from '@/tina/__generated__/types';

interface ContentProps {
  data: PageBlocksContent;
}

export const Content = ({ data }: ContentProps) => {
  return (
    <Section color={data.color}>
      <Container
        className={cn(
          'prose prose-lg',
          data.color === 'primary' ? 'prose-primary' : 'dark:prose-dark'
        )}
        size='large'
        width='medium'
        data-tina-field={tinaField(data, 'body')}
      >
        <TinaMarkdown content={data.body} components={customComponents} />
      </Container>
    </Section>
  );
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
      type: 'rich-text',
      label: 'Body',
      name: 'body',
    },
    colorFieldSchema,
  ],
};
