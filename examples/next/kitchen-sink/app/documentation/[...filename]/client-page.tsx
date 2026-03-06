'use client';
import { useTina } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import { titleColorClasses } from '@/lib/utils';
import { customComponents } from '@/components/markdown-components';
import { useLayout } from '@/components/layout/layout-context';
import { Section } from '@/components/layout/section';
import { Container } from '@/components/layout/container';

type TinaProps = {
  query: string;
  variables: Record<string, any>;
  data: any;
};

export default function DocumentationClientPage(props: TinaProps) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });
  const { theme } = useLayout();

  if (data?.documentation) {
    return (
      <Section className='flex-1'>
        <Container width='small' size='large'>
          <h1 className='w-full relative mb-8 text-6xl font-extrabold tracking-normal text-center title-font'>
            <span
              className={`bg-clip-text text-transparent bg-gradient-to-r ${titleColorClasses[theme.color] || titleColorClasses.blue}`}
            >
              {data.documentation.title}
            </span>
          </h1>
        </Container>
        <Container className='flex-1 pt-4' width='small' size='large'>
          <div className='prose dark:prose-dark w-full max-w-none'>
            <TinaMarkdown
              components={customComponents}
              content={data.documentation.body}
            />
          </div>
          {data.documentation.tags && data.documentation.tags.length > 0 && (
            <div className='mt-8 pt-8 border-t border-gray-200 dark:border-gray-800'>
              <h3 className='font-semibold text-gray-900 dark:text-gray-50 mb-3'>
                Tags
              </h3>
              <div className='flex flex-wrap gap-2'>
                {data.documentation.tags.map((tagRef: any, idx: number) => (
                  <span
                    key={idx}
                    className='px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm'
                  >
                    {tagRef.reference?.name ||
                      tagRef.reference?.title ||
                      'Unknown'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Container>
      </Section>
    );
  }

  return <div className='py-12 text-center text-gray-500'>No data</div>;
}
