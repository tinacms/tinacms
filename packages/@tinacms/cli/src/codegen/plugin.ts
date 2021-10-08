import { Types, PluginFunction } from '@graphql-codegen/plugin-helpers'

import { print, ASTNode, DefinitionNode } from 'graphql'

export const AddGeneratedClientFunc: PluginFunction = (
  schema,
  documents,
  _config,
  _info
) => {
  // console.log({ schema })
  const typeMap = schema.getTypeMap()

  const types = Object.keys(typeMap)
  const fields = schema.getQueryType().getFields()
  const fieldsKeys = Object.keys(fields)

  const defs: DefinitionNode[] = []
  // defs.push({
  //   kind: 'FragmentDefinition',
  //   name: {
  //     kind: 'Name',
  //     value: 'getPostsDocumentParts',
  //   },
  //   typeCondition: {
  //     kind: 'NamedType',
  //     name: {
  //       kind: 'Name',
  //       value: 'PostsDocument',
  //     },
  //   },
  //   directives: [],
  //   selectionSet: {
  //     kind: 'SelectionSet',
  //     selections: [
  //       {
  //         kind: 'Field',
  //         name: {
  //           kind: 'Name',
  //           value: 'form',
  //         },
  //         arguments: [],
  //         directives: [],
  //       },
  //     ],
  //   },
  // })

  fieldsKeys.forEach((key) => {
    const test = fields[key].type.toJSON().replace('!', '')
    // console.log({ typeMap })
    console.log({ test })
    // @ts-ignore
    const typeFields = typeMap[test]?.toConfig().fields
    console.log({ typeFields })
    typeFields &&
      defs.push({
        kind: 'FragmentDefinition',
        name: {
          kind: 'Name',
          value: fields[key].name + 'Parts',
        },
        typeCondition: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: fields[key].type.toString(),
          },
        },
        selectionSet: {
          kind: 'SelectionSet',
          // TODO: traverse the AST node to find all top level fields
          selections: Object.keys(typeFields).map((x) => ({
            kind: 'Field',
            name: { kind: 'Name', value: x },
          })),
        },
      })
  })
  const frags = print({ definitions: defs, kind: 'Document' })
  console.log({ frags })

  // console.log(types)
  // types.forEach(type=>{
  // const fields = schema.getType(type).astNode.
  // })

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
