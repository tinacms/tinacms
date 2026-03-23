// @ts-nocheck
import { resolve } from "@tinacms/datalayer";
import type { TinaClient } from "tinacms/dist/client";

import { queries } from "./types";
import database from "../database";

export async function databaseRequest({ query, variables, user }) {
  const result = await resolve({
    config: {
      useRelativeMedia: true,
    },
    database,
    query,
    variables,
    verbose: true,
    ctxUser: user,
  });

  return result;
}

export async function authenticate({ username, password }) {
    return databaseRequest({
      query: `query auth($username:String!, $password:String!) {
              authenticate(sub:$username, password:$password) {
               
              }
            }`,
      variables: { username, password },
    })
}

export async function authorize(user: { sub: string }) {
  return databaseRequest({
    query: `query authz { authorize { } }`,
    variables: {},
    user
  })
}

function createDatabaseClient<GenQueries = Record<string, unknown>>({
  queries,
}: {
  queries: (client: {
    request: TinaClient<GenQueries>["request"];
  }) => GenQueries;
}) {
  const request = async ({ query, variables, user }) => {
    const data = await databaseRequest({ query, variables, user });
    return { data: data.data as any, query, variables, errors: data.errors || null };
  };
  const q = queries({
    request,
  });
  return { queries: q, request, authenticate, authorize };
}

export const databaseClient = createDatabaseClient({ queries });

export const client = databaseClient;

export default databaseClient;
