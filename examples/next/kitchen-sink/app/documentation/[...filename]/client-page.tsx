'use client';
import { useTina } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import type { TinaPageProps } from '@/lib/types';
import { customComponents } from '@/components/markdown-components';
import { Section } from '@/components/layout/section';
import { Container } from '@/components/layout/container';
import { GradientTitle } from '@/components/ui/gradient-title';
import { NoData } from '@/components/ui/no-data';
import { Badge } from '@/components/ui/badge';

export default function DocumentationClientPage(props: TinaPageProps) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });

  if (data?.documentation) {
    return (
      <Section className='flex-1'>
        <Container width='small' size='large'>
          <GradientTitle>{data.documentation.title}</GradientTitle>
        </Container>
        <Container className='flex-1 pt-4' width='small' size='large'>
          <div className='prose dark:prose-dark w-full max-w-none'>
            <TinaMarkdown
              components={customComponents}
              content={data.documentation._body}
            />
          </div>
          {data.documentation.tags && data.documentation.tags.length > 0 && (
            <div className='mt-8 pt-8 border-t border-gray-200 dark:border-gray-800'>
              <h3 className='font-semibold text-gray-900 dark:text-gray-50 mb-3'>
                Tags
              </h3>
              <div className='flex flex-wrap gap-2'>
                {data.documentation.tags.map((tagRef: any, idx: number) => (
                  <Badge key={idx} size='sm'>
                    {tagRef.tag?.name || 'Unknown'}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Container>
      </Section>
    );
  }

  return <NoData />;
}
