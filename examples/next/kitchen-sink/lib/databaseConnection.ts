import database from '../tina/database';
import { queries } from '../tina/__generated__/types';
import { resolve } from '@tinacms/datalayer';
import type { TinaClient } from 'tinacms/dist/client';

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
    variables,
    verbose: true,
  });

  return result;
}

export function getDatabaseConnection<GenQueries = Record<string, unknown>>({
  queries,
}: {
  queries: (client: {
    request: TinaClient<GenQueries>['request'];
  }) => GenQueries;
}) {
  const request = async ({ query, variables }: GraphQLRequestParams) => {
    const data = await databaseRequest({ query, variables });
    return { data: data.data, query, variables, errors: data.errors };
  };
  const q = queries({
    request,
  });
  return { queries: q, request };
}

export const dbConnection = getDatabaseConnection({ queries });
