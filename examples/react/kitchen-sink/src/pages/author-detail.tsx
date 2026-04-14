import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { sanitizeImageSrc } from '@/src/lib/utils';
import { useTina, tinaField } from 'tinacms/dist/react';
import { Section } from '@/src/components/layout/section';
import { Container } from '@/src/components/layout/container';
import { GradientTitle } from '@/src/components/ui/gradient-title';
import { NoData } from '@/src/components/ui/no-data';
import { Badge } from '@/src/components/ui/badge';
import { Loading } from '@/src/loading';
import { useTinaQuery } from '@/src/hooks/use-tina-query';
import client from '@/tina/__generated__/client';

export default function AuthorDetail() {
  const { filename } = useParams<{ filename: string }>();
  const relativePath = `${filename}.md`;

  const queryFn = useCallback(
    () => client.queries.author({ relativePath }),
    [relativePath]
  );
  const result = useTinaQuery(queryFn);

  if (result.loading) return <Loading />;
  if (result.error || !result.data)
    return <NoData message='Author not found' />;

  return (
    <AuthorClient
      data={result.data}
      query={result.query}
      variables={result.variables}
    />
  );
}

function AuthorClient(props: {
  data: any;
  query: string;
  variables: Record<string, unknown>;
}) {
  const { data } = useTina({ ...props });

  if (!data?.author) return <NoData />;

  const avatarSrc = data.author.avatar
    ? sanitizeImageSrc(data.author.avatar)
    : '';

  return (
    <Section className='flex-1'>
      <Container width='small' size='large'>
        <div className='flex flex-col items-center text-center mb-16'>
          {avatarSrc && (
            <img
              src={avatarSrc}
              alt={data.author.name}
              width={128}
              height={128}
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
