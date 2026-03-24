import { useTina, tinaField } from 'tinacms/dist/react';
import { sanitizeImageSrc } from '@/lib/utils';
import type { TinaPageProps } from '@/lib/types';

export default function AuthorDetail(props: TinaPageProps) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });

  if (!data?.author) {
    return <p>No author data found.</p>;
  }

  const avatarSrc = data.author.avatar
    ? sanitizeImageSrc(data.author.avatar)
    : '';

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        {avatarSrc && (
          <img
            src={avatarSrc}
            alt={data.author.name}
            width={128}
            height={128}
            style={{
              borderRadius: '50%',
              marginBottom: '1rem',
              objectFit: 'cover',
            }}
            data-tina-field={tinaField(data.author, 'avatar')}
          />
        )}
        <h1 data-tina-field={tinaField(data.author, 'name')}>
          {data.author.name}
        </h1>
        {data.author.description && (
          <p
            style={{ color: '#666' }}
            data-tina-field={tinaField(data.author, 'description')}
          >
            {data.author.description}
          </p>
        )}
      </div>

      {data.author.hobbies && data.author.hobbies.length > 0 && (
        <div data-tina-field={tinaField(data.author, 'hobbies')}>
          <h3>Hobbies</h3>
          <ul>
            {data.author.hobbies.map((hobby: any, idx: number) => {
              const hobbyText =
                typeof hobby === 'string'
                  ? hobby
                  : hobby?.name || hobby?.title || String(hobby);
              return <li key={idx}>{hobbyText}</li>;
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
