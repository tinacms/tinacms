'use client';
import type { PostQuery } from '@/tina/__generated__/types';
import React from 'react';
import { tinaField, useTina } from 'tinacms/dist/react';
import { Components, TinaMarkdown } from 'tinacms/dist/rich-text';

interface ClientPageProps {
  query: string;
  variables: {
    relativePath: string;
  };
  data: PostQuery;
}

const components: Components<{
  DateTime: {
    format?: string;
  };
}> = {
  DateTime: (props) => {
    const dt = React.useMemo(() => {
      return new Date();
    }, []);

    let dateTimeString = dt.toLocaleDateString();
    switch (props.format) {
      case 'iso':
        dateTimeString = dt.toISOString();
      case 'utc':
        dateTimeString = dt.toUTCString();
      case 'local':
        dateTimeString = dt.toLocaleDateString();
    }

    return (
      <div data-tina-field={tinaField(props, 'format')}>
        Date Time Format: {props.format}
        <br />
        <time dateTime={dt.toISOString()}>{dateTimeString}</time>
      </div>
    );
  },
};

export default function Post(props: ClientPageProps) {
  // data passes though in production mode and data is updated to the sidebar data in edit-mode
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });
  return (
    <>
      <TinaMarkdown
        data-tina-field={tinaField(data.post, 'body')}
        content={data.post.body}
        components={components}
      />
      <code>
        <pre>{JSON.stringify(data.post, null, 2)}</pre>
      </code>
    </>
  );
}
