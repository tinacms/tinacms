/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import type { PluginFunction } from '@graphql-codegen/plugin-helpers'
// We should obviously pass this in as an argument
import tinaSchema from '../../../../../examples/tina-cloud-starter/.tina/__generated__/_schema.json'
import { NAMER } from '@tinacms/graphql'

export const AddGeneratedClientFunc: PluginFunction = (
  _schema,
  _documents,
  _config,
  _info
) => {
  return `
// TinaSDK generated code

type QueryMap = {
  posts: {
    author: GetAuthorsDocumentQuery["getAuthorsDocument"]
  }
};

import { parse, print, visit } from 'graphql'

${tinaSchema.collections
  .map((collection) => {
    let queryMap = {}
    let referenceMap = []
    let constMap = []
    let typeExt = []
    let m
    collection.fields.forEach((field) => {
      if (field.type === 'reference') {
        const items = []
        field.collections.forEach((collectionName) => {
          items.push(
            ` {name: "${NAMER.documentTypeName([
              collectionName,
            ])}", fragment: ${NAMER.dataTypeName([
              collectionName,
            ])}PartsFragmentDoc} `
          )
        })
        referenceMap.push(` ${field.name}?: boolean `)
        queryMap[field.name] = field.collections
          .map((referenceName) => {
            return `Get${NAMER.documentTypeName([
              referenceName,
            ])}Query["${NAMER.queryName([referenceName])}"]`
          })
          .join(' | ')
        m =
          '{ ' +
          Object.entries(queryMap)
            .map(([key, value]) => {
              return `${key}: ${value}`
            })
            .join(',') +
          ' }'
        constMap.push(` ${field.name}: [${items.join(', ')}]`)
        typeExt.push(`
type Meh<Ext extends object> = Get${NAMER.documentTypeName([
          collection.name,
        ])}Query & {
  getPostsDocument: {
    data: GetPostsDocumentQuery["getPostsDocument"]["data"] & Ext
  }
}
type Ok = Meh<{author: {data: {title: string}}}>
        `)
      }
    })
    return `
${typeExt}
type ${NAMER.dataTypeName([
      collection.name,
    ])}ReferenceKeys = {${referenceMap.join(', ')}}
type ${NAMER.dataTypeName([collection.name])}QueryMap = ${m}
const ${NAMER.dataTypeName([collection.name])}Queries = {${constMap.join(', ')}}
`
  })
  .join('\n')}

  const replaceQuery = (queryString, lookup, options) => {
    const meh = parse(queryString);

    const filteredLookup = {};
    Object.entries(lookup).forEach(([key, value]) => {
      if (Object.keys(options).includes(key)) {
        if (!!options[key]) {
          filteredLookup[key] = value;
        }
      }
    });

    const newQuery = visit(meh, {
      Field: (node) => {
        if (Object.keys(filteredLookup).includes(node.name.value)) {
          const queryItems = filteredLookup[node.name.value];
          const newNode = {
            kind: "Field",
            name: node.name,
            selectionSet: {
              kind: "SelectionSet",
              selections: queryItems.map((queryItem) => {
                return {
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: {
                      kind: "Name",
                      value: queryItem.name,
                    },
                  },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: {
                          kind: "Name",
                          value: "id",
                        },
                      },
                      {
                        kind: "Field",
                        name: {
                          kind: "Name",
                          value: "data",
                        },
                        arguments: [],
                        directives: [],
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: parse(queryItem.fragment).definitions[0]
                            .selectionSet.selections,
                        },
                      },
                    ],
                  },
                };
              }),
            },
          };

          return newNode;
        }
      },
    });
    return print(newQuery);
  };


import { LocalClient } from 'tinacms'
const tinaClient = new LocalClient();
const requester: (doc: any, vars?: any, options?: any) => Promise<any> = async (
  doc,
  vars,
  _options = {}
) => {
  const query = replaceQuery(doc, PostsQueries, _options);
  const data = await tinaClient.request(query, { variables: vars });
  return { data, query, variables: vars };
};
export const getTinaClient = ()=>getSdk(requester)
`
}

export const AddGeneratedClient = {
  plugin: AddGeneratedClientFunc,
}
