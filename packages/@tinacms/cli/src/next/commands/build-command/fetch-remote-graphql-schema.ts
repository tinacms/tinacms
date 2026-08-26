import { getIntrospectionQuery } from 'graphql';

export const fetchRemoteGraphqlSchema = async ({
  url,
  token,
}: {
  url: string;
  token?: string;
}) => {
  const headers = new Headers();
  if (token) {
    headers.append('X-API-KEY', token);
  }
  const body = JSON.stringify({
    query: getIntrospectionQuery(),
    variables: {},
  });

  headers.append('Content-Type', 'application/json');

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body,
  });

  const data = await res.json();

  if (data?.errors?.length) {
    const statusInfo = res.ok
      ? ''
      : ` (status code ${res.status}, ${res.statusText})`;
    throw new Error(
      `The remote GraphQL API returned an error${statusInfo}: ${data.errors
        .map((error) => error.message)
        .join('\n')}`
    );
  }
  if (!res.ok) {
    throw new Error(
      `Failed to fetch the remote GraphQL schema. Server responded with status code ${res.status}, ${res.statusText}.`
    );
  }

  return {
    remoteSchema: data?.data,
    remoteRuntimeVersion: res.headers.get('tinacms-grapqhl-version'),
    remoteProjectVersion: res.headers.get('tinacms-graphql-project-version'),
  };
};
