'use client';
import Image from 'next/image';
import { useTina } from 'tinacms/dist/react';
import { sanitizeImageSrc } from '@/lib/utils';
import type { TinaPageProps } from '@/lib/types';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import { customComponents } from '@/components/markdown-components';
import { Section } from '@/components/layout/section';
import { Container } from '@/components/layout/container';
import { GradientTitle } from '@/components/ui/gradient-title';
import { NoData } from '@/components/ui/no-data';
import { Badge } from '@/components/ui/badge';

export default function AuthorClientPage(props: TinaPageProps) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });

  if (data?.author) {
    return (
      <Section className='flex-1'>
        <Container width='small' size='large'>
          <div className='flex flex-col items-center text-center mb-16'>
            {(() => {
              const avatarSrc = data.author.avatar
                ? sanitizeImageSrc(data.author.avatar)
                : '';
              return avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt={data.author.name}
                  width={128}
                  height={128}
                  priority
                  className='rounded-full mb-6 object-cover shadow-sm'
                />
              ) : null;
            })()}
            <GradientTitle size='5xl' className='mb-4'>
              {data.author.name}
            </GradientTitle>
            {data.author.description && (
              <p className='text-lg text-gray-600 dark:text-gray-400 max-w-2xl'>
                {data.author.description}
              </p>
            )}
          </div>

          {data.author.body && (
            <div className='prose prose-lg dark:prose-dark w-full max-w-none mb-8'>
              <TinaMarkdown
                components={customComponents}
                content={data.author.body}
              />
            </div>
          )}

          {data.author.hobbies && data.author.hobbies.length > 0 && (
            <div className='mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4'>
                Hobbies
              </h3>
              <div className='flex flex-wrap gap-2'>
                {data.author.hobbies.map((hobby: any, idx: number) => {
                  const hobbyText =
                    typeof hobby === 'string'
                      ? hobby
                      : hobby?.name || hobby?.title || String(hobby);
                  return <Badge key={idx}>{hobbyText}</Badge>;
                })}
              </div>
            </div>
          )}
        </Container>
      </Section>
    );
  }

  return <NoData />;
}
