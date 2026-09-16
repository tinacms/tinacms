import { getIntrospectionQuery } from 'graphql';

const FAQ_LINK = 'https://tina.io/docs/r/FAQ/';

// The server builds DocumentFilter/DocumentMutation from the collection list, so
// graphql-js only rejects them as empty when the indexed schema has no collections.
const EMPTY_ROOT_TYPES = ['DocumentFilter', 'DocumentMutation'];

const staleLockFileHint = (messages: string[]) => {
  const hasEmptyRootType = messages.some((message) =>
    EMPTY_ROOT_TYPES.some((type) =>
      message.includes(
        `Input Object type ${type} must define one or more fields`
      )
    )
  );
  if (!hasEmptyRootType) {
    return '';
  }
  return `\n\nThe remote schema has no collections, which usually means tina/tina-lock.json is out of date. Only \`tinacms dev\` regenerates that file, so a project that only runs \`tinacms build\` keeps publishing a stale lock file. Run \`tinacms dev\` locally, then commit and push tina/tina-lock.json.`;
};

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

  let data;
  try {
    data = await res.json();
  } catch {
    data = undefined;
  }

  // GraphQL allows data and errors together; errors are only fatal when no schema came back.
  const hasUsableSchema = res.ok && Boolean(data?.data);

  if (data?.errors?.length && !hasUsableSchema) {
    const messages = data.errors.map((error) =>
      typeof error?.message === 'string' ? error.message : JSON.stringify(error)
    );
    const statusInfo = res.ok
      ? ''
      : ` (status code ${res.status}, ${res.statusText})`;
    throw new Error(
      `The remote GraphQL API returned an error${statusInfo}: ${messages.join(
        '\n'
      )}${staleLockFileHint(messages)}`
    );
  }

  if (!res.ok) {
    let message = `Failed to fetch the remote GraphQL schema. Server responded with status code ${res.status}, ${res.statusText}.`;
    if (res.status === 401 || res.status === 403) {
      message += ` Please check that your client ID, URL and read only token are configured properly.`;
    }
    if (data?.message) {
      message += `\n\nMessage from server: ${data.message}`;
    }
    throw new Error(`${message}\n\nSee ${FAQ_LINK} for more information.`);
  }

  if (!data) {
    throw new Error(
      `The remote GraphQL API returned a response that could not be parsed as JSON (status code ${res.status}, ${res.statusText}).`
    );
  }

  return {
    remoteSchema: data?.data,
    remoteRuntimeVersion: res.headers.get('tinacms-grapqhl-version'),
    remoteProjectVersion: res.headers.get('tinacms-graphql-project-version'),
  };
};
