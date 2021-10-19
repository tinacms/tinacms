import { Types, PluginFunction } from '@graphql-codegen/plugin-helpers'

import { print, ASTNode, DefinitionNode } from 'graphql'

export const AddGeneratedClientFunc: PluginFunction = (
  _schema,
  _documents,
  _config,
  _info
) => {
  return `
// TinaSDK generated code

import { LocalClient } from 'tinacms'
const tinaClient = new LocalClient();
const requester: (doc: any, vars?: any, options?: any) => Promise<any> = async (
  doc,
  vars,
  _options
) => {
  const data = await tinaClient.request(doc, { variables: vars });
  return data;
};
export const getTinaClient = ()=>getSdk(requester)
`
}

export const AddGeneratedClient = {
  plugin: AddGeneratedClientFunc,
}
