import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { customComponents } from '@/components/markdown-components';
import { cn } from '@/lib/utils';
import React from 'react';
import { tinaField } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';

interface ContentProps {
  data: any;
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
