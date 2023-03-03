/**

*/

import type { PluginFunction } from '@graphql-codegen/plugin-helpers'

export const AddGeneratedClientFunc: (apiURL: string) => PluginFunction = (
  apiURL
) => {
  return (_schema, _documents, _config, _info) => {
    return `
// TinaSDK generated code
import { createClient, TinaClient } from "tinacms/dist/client";

const generateRequester = (client: TinaClient) => {
  const requester: (
    doc: any,
    vars?: any,
    options?: any,
    client
  ) => Promise<any> = async (doc, vars, _options) => {
    const data = await client.request({
      query: doc,
      variables: vars,
    });

    return { data: data?.data, query: doc, variables: vars || {} };
  };

  return requester;
};

/**
 * @experimental this class can be used but may change in the future
 **/
export const ExperimentalGetTinaClient = () =>
  getSdk(
    generateRequester(createClient({ url: "${apiURL}", queries }))
  );

export const queries = (client: TinaClient) => {
  const requester = generateRequester(client);
  return getSdk(requester);
};
`
  }
}

export const AddGeneratedClient = (apiURL: string) => ({
  plugin: AddGeneratedClientFunc(apiURL),
})
