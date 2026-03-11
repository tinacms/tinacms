import database from '../tina/database';
import { resolve } from '@tinacms/datalayer';

interface GraphQLRequestParams {
  query: string;
  variables?: Record<string, unknown>;
}

export async function databaseRequest({
  query,
  variables,
}: GraphQLRequestParams) {
  const config = {
    useRelativeMedia: true,
  } as const;

  const result = await resolve({
    config,
    database,
    query,
    variables: variables ?? {},
    verbose: true,
  });

  return result;
}
