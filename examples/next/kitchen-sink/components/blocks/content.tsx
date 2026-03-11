'use client';
import React from 'react';
import { Section, Container } from '../layout';
import RichText from '@/lib/richText';
import { colorFieldSchema } from '@/tina/schemas/shared-fields';
import type { PageBlocksContent } from '@/tina/__generated__/types';

interface ContentProps {
  data: PageBlocksContent;
  parentField?: string;
}

export const Content = ({ data, parentField = '' }: ContentProps) => {
  return (
    <Section color={data.color}>
      <Container
        className={`prose prose-lg ${
          data.color === 'primary' ? `prose-primary` : `dark:prose-dark`
        }`}
        size='large'
        width='medium'
        data-tinafield={`${parentField}.body`}
      >
        <RichText content={data.body} />
      </Container>
    </Section>
  );
};

export const contentBlockSchema = {
  name: 'content',
  label: 'Content',
  ui: {
    previewSrc: '/blocks/content.png',
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
