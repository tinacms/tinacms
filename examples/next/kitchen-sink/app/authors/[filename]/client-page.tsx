'use client';
import Image from 'next/image';
import { useTina, tinaField } from 'tinacms/dist/react';
import { sanitizeImageSrc } from '@/lib/utils';
import type { TinaPageProps } from '@/lib/types';
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
    const avatarSrc = data.author.avatar
      ? sanitizeImageSrc(data.author.avatar)
      : '';

    return (
      <Section className='flex-1'>
        <Container width='small' size='large'>
          <div className='flex flex-col items-center text-center mb-16'>
            {avatarSrc && (
              <Image
                src={avatarSrc}
                alt={data.author.name}
                width={128}
                height={128}
                priority
                className='rounded-full mb-6 object-cover shadow-sm'
                data-tina-field={tinaField(data.author, 'avatar')}
              />
            )}
            <GradientTitle
              size='5xl'
              className='mb-4'
              data-tina-field={tinaField(data.author, 'name')}
            >
              {data.author.name}
            </GradientTitle>
            {data.author.description && (
              <p
                className='text-lg text-gray-600 dark:text-gray-400 max-w-2xl'
                data-tina-field={tinaField(data.author, 'description')}
              >
                {data.author.description}
              </p>
            )}
          </div>

          {data.author.hobbies && data.author.hobbies.length > 0 && (
            <div
              className='mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg'
              data-tina-field={tinaField(data.author, 'hobbies')}
            >
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
