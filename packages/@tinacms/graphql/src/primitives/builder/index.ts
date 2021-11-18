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

import _ from 'lodash'
import { Database } from '../database'
import { astBuilder, NAMER } from '../ast-builder'
import { sequential } from '../util'
import { staticDefinitions } from './static-definitions'

import type {
  UnionTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  TypeDefinitionNode,
  InputObjectTypeDefinitionNode,
  FieldNode,
  SelectionSetNode,
  InlineFragmentNode,
} from 'graphql'
import type {
  TinaCloudCollectionEnriched,
  TinaFieldEnriched,
  CollectionTemplateable,
  Collectable,
  Templateable,
  TinaFieldInner,
  Template,
} from '../types'
import { TinaSchema } from '../schema'

export const createBuilder = async ({
  database,
  tinaSchema,
}: {
  database: Database
  tinaSchema: TinaSchema
}) => {
  return new Builder({ database, tinaSchema: tinaSchema })
}

/**
 * The builder class is responsible for creating GraphQL AST definitions
 * for a given portion of the Tina schema. In some cases that will also mean
 * storing a reference to how we can resolve that type when we come across it.
 */
export class Builder {
  // public baseSchema: TinaCloudSchemaBase;
  public tinaSchema: TinaSchema
  public database: Database
  constructor(public config: { database: Database; tinaSchema: TinaSchema }) {
    this.tinaSchema = config.tinaSchema
    this.database = config.database
  }
  /**
   * ```graphql
   * # ex.
   * {
   *   getCollection(collection: $collection) {
   *     name
   *     documents {...}
   *   }
   * }
   * ```
   *
   * @param collections
   */
  public buildCollectionDefinition = async (
    collections: TinaCloudCollectionEnriched[]
  ) => {
    const name = 'getCollection'
    const typeName = 'Collection'
    const args = [
      astBuilder.InputValueDefinition({
        name: 'collection',
        type: astBuilder.TYPES.String,
      }),
    ]

    const documentsType =
      await this._buildMultiCollectionDocumentListDefinition({
        fieldName: 'documents',
        namespace: ['document'],
        nodeType: astBuilder.TYPES.MultiCollectionDocument,
        collections,
        connectionNamespace: ['document'],
      })
    const type = astBuilder.ObjectTypeDefinition({
      name: typeName,
      fields: [
        astBuilder.FieldDefinition({
          name: 'name',
          required: true,
          type: astBuilder.TYPES.String,
        }),
        astBuilder.FieldDefinition({
          name: 'slug',
          required: true,
          type: astBuilder.TYPES.String,
        }),
        astBuilder.FieldDefinition({
          name: 'label',
          required: true,
          type: astBuilder.TYPES.String,
        }),
        astBuilder.FieldDefinition({
          name: 'path',
          required: true,
          type: astBuilder.TYPES.String,
        }),
        astBuilder.FieldDefinition({
          name: 'format',
          required: false,
          type: astBuilder.TYPES.String,
        }),
        astBuilder.FieldDefinition({
          name: 'matches',
          required: false,
          type: astBuilder.TYPES.String,
        }),
        astBuilder.FieldDefinition({
          name: 'templates',
          list: true,
          type: 'JSON',
        }),
        astBuilder.FieldDefinition({
          name: 'fields',
          list: true,
          type: 'JSON',
        }),
        documentsType,
      ],
    })
    return astBuilder.FieldDefinition({ type, name, args, required: true })
  }

  /**
   * ```graphql
   * # ex.
   * {
   *   getCollections {
   *     name
   *     documents {...}
   *   }
   * }
   * ```
   *
   * @param collections
   */
  public buildMultiCollectionDefinition = async (
    collections: TinaCloudCollectionEnriched[]
  ) => {
    const name = 'getCollections'
    const typeName = 'Collection'

    return astBuilder.FieldDefinition({
      type: typeName,
      name,
      list: true,
      required: true,
    })
  }

  /**
   * ```graphql
   * # ex.
   * {
   *   node(id: $id) {
   *     id
   *     data {...}
   *   }
   * }
   * ```
   */
  public multiNodeDocument = async () => {
    const name = 'node'
    const args = [
      astBuilder.InputValueDefinition({
        name: 'id',
        type: astBuilder.TYPES.String,
      }),
    ]
    await this.database.addToLookupMap({
      type: astBuilder.TYPES.Node,
      resolveType: 'nodeDocument',
    })

    return astBuilder.FieldDefinition({
      name: name,
      args,
      list: false,
      type: astBuilder.TYPES.Node,
      required: true,
    })
  }

  /**
   * ```graphql
   * # ex.
   * {
   *   getDocument(collection: $collection, relativePath: $relativePath) {
   *     id
   *     data {...}
   *   }
   * }
   * ```
   *
   * @param collections
   */
  public multiCollectionDocument = async (
    collections: TinaCloudCollectionEnriched[]
  ) => {
    const name = 'getDocument'
    const args = [
      astBuilder.InputValueDefinition({
        name: 'collection',
        type: astBuilder.TYPES.String,
      }),
      astBuilder.InputValueDefinition({
        name: 'relativePath',
        type: astBuilder.TYPES.String,
      }),
    ]

    const type = await this._buildMultiCollectionDocumentDefinition({
      fieldName: astBuilder.TYPES.MultiCollectionDocument,
      collections,
    })

    return astBuilder.FieldDefinition({
      name: name,
      args,
      list: false,
      type: type,
      required: true,
    })
  }

  /**
   * ```graphql
   * {
   *    getDocumentFields()
   * }
   * ```
   */

  public multiCollectionDocumentFields = async () => {
    return astBuilder.FieldDefinition({
      name: 'getDocumentFields',
      required: true,
      type: 'JSON',
    })
  }

  /**
   * ```graphql
   * # ex.
   * {
   *   addPendingDocument(collection: $collection, relativePath: $relativePath, params: $params) {
   *     id
   *     data {...}
   *   }
   * }
   * ```
   *
   * @param collections
   */
  public addMultiCollectionDocumentMutation = async () => {
    return astBuilder.FieldDefinition({
      name: 'addPendingDocument',
      args: [
        astBuilder.InputValueDefinition({
          name: 'collection',
          required: true,
          type: astBuilder.TYPES.String,
        }),
        astBuilder.InputValueDefinition({
          name: 'relativePath',
          required: true,
          type: astBuilder.TYPES.String,
        }),
        astBuilder.InputValueDefinition({
          name: 'template',
          required: false,
          type: astBuilder.TYPES.String,
        }),
      ],
      required: true,
      type: astBuilder.TYPES.MultiCollectionDocument,
    })
  }

  /**
   * ```graphql
   * # ex.
   * {
   *   createDocument(relativePath: $relativePath, params: $params) {
   *     id
   *     data {...}
   *   }
   * }
   * ```
   *
   * @param collections
   */
  public buildCreateCollectionDocumentMutation = async (
    collections: TinaCloudCollectionEnriched[]
  ) => {
    return astBuilder.FieldDefinition({
      name: 'createDocument',
      args: [
        astBuilder.InputValueDefinition({
          name: 'collection',
          required: false,
          type: astBuilder.TYPES.String,
        }),
        astBuilder.InputValueDefinition({
          name: 'relativePath',
          required: true,
          type: astBuilder.TYPES.String,
        }),
        astBuilder.InputValueDefinition({
          name: 'params',
          required: true,
          type: await this._buildReferenceMutation({
            namespace: ['document'],
            collections: collections.map((collection) => collection.name),
          }),
        }),
      ],
      required: true,
      type: astBuilder.TYPES.MultiCollectionDocument,
    })
  }

  /**
   * ```graphql
   * # ex.
   * {
   *   updateDocument(relativePath: $relativePath, params: $params) {
   *     id
   *     data {...}
   *   }
   * }
   * ```
   *
   * @param collections
   */
  public buildUpdateCollectionDocumentMutation = async (
    collections: TinaCloudCollectionEnriched[]
  ) => {
    return astBuilder.FieldDefinition({
      name: 'updateDocument',
      args: [
        astBuilder.InputValueDefinition({
          name: 'collection',
          required: false,
          type: astBuilder.TYPES.String,
        }),
        astBuilder.InputValueDefinition({
          name: 'relativePath',
          required: true,
          type: astBuilder.TYPES.String,
        }),
        astBuilder.InputValueDefinition({
          name: 'params',
          required: true,
          type: await this._buildReferenceMutation({
            namespace: ['document'],
            collections: collections.map((collection) => collection.name),
          }),
        }),
      ],
      required: true,
      type: astBuilder.TYPES.MultiCollectionDocument,
    })
  }

  /**
   * ```graphql
   * # ex.
   * {
   *   getDocumentList(first: 10) {
   *     edges {
   *       node {
   *         id
   *       }
   *     }
   *   }
   * }
   * ```
   *
   * @param collections
   */
  public multiCollectionDocumentList = async (
    collections: TinaCloudCollectionEnriched[]
  ) => {
    return this._buildMultiCollectionDocumentListDefinition({
      fieldName: 'getDocumentList',
      namespace: ['document'],
      nodeType: astBuilder.TYPES.MultiCollectionDocument,
      collections: collections,
      connectionNamespace: ['document'],
    })
  }

  /**
   * ```graphql
   * # ex.
   * {
   *   getPostDocument(relativePath: $relativePath) {
   *     id
   *     data {...}
   *   }
   * }
   * ```
   *
   * @param collection
   */
  public collectionDocument = async (
    collection: TinaCloudCollectionEnriched
  ) => {
    const name = NAMER.queryName([collection.name])
    const type = await this._buildCollectionDocumentType(collection)
    const args = [
      astBuilder.InputValueDefinition({
        name: 'relativePath',
        type: astBuilder.TYPES.String,
      }),
    ]
    await this.database.addToLookupMap({
      type: type.name.value,
      resolveType: 'collectionDocument',
      collection: collection.name,
      [NAMER.createName([collection.name])]: 'create',
      [NAMER.updateName([collection.name])]: 'update',
    })
    return astBuilder.FieldDefinition({ type, name, args, required: true })
  }

  /**
   * Turns a collection into a fragment that gets updated on build. This fragment does not resolve references
   * ```graphql
   * # ex.
   * fragment AuthorsParts on Authors {
   *   name
   *   avatar
   *   ...
   * }
   * ```
   *
   * @public
   * @param collection a Tina Cloud collection
   */
  public collectionFragment = async (
    collection: TinaCloudCollectionEnriched
  ) => {
    const name = NAMER.dataTypeName(collection.namespace)
    const fragmentName = NAMER.fragmentName(collection.namespace)

    if (typeof collection.fields === 'object') {
      const selections = []
      await sequential(collection.fields, async (x) => {
        const field = await this._buildFieldNodeForFragments(x)
        selections.push(field)
      })

      return astBuilder.FragmentDefinition({
        name,
        fragmentName,
        selections: filterSelections(selections),
      })
    } else {
      const selections = []
      await sequential(collection.templates, async (tem) => {
        if (typeof tem === 'object') {
          // TODO: Handle when template is a string
          selections.push(await this.buildTemplateFragments(tem))
        }
      })
      return astBuilder.FieldWithSelectionSetDefinition({
        name,
        selections: filterSelections(selections),
      })
    }
  }

  private _buildFieldNodeForFragments: (
    field: TinaFieldInner<true>
  ) => Promise<SelectionSetNode | FieldNode> = async (field) => {
    switch (field.type) {
      case 'string':
      case 'image':
      case 'datetime':
      case 'number':
      case 'boolean':
      case 'rich-text':
        return astBuilder.FieldNodeDefinition(field)
      case 'object':
        if (typeof field.fields === 'object') {
          const selections = []
          await sequential(field.fields, async (item) => {
            const field = await this._buildFieldNodeForFragments(item)
            selections.push(field)
          })

          return astBuilder.FieldWithSelectionSetDefinition({
            name: field.name,
            selections: [
              { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
              ...filterSelections(selections),
            ],
          })
        } else if (typeof field.templates === 'object') {
          const selections = []
          await sequential(field.templates, async (tem) => {
            if (typeof tem === 'object') {
              // TODO: Handle when template is a string
              selections.push(await this.buildTemplateFragments(tem))
            }
          })
          return astBuilder.FieldWithSelectionSetDefinition({
            name: field.name,
            selections: [
              { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
              ...filterSelections(selections),
            ],
          })
        }
      case 'reference':
        return astBuilder.FieldWithSelectionSetDefinition({
          name: field.name,
          selections: [
            {
              kind: 'InlineFragment',
              typeCondition: {
                kind: 'NamedType',
                name: {
                  kind: 'Name',
                  value: 'Document',
                },
              },
              directives: [],
              selectionSet: {
                kind: 'SelectionSet',
                selections: [
                  {
                    kind: 'Field',
                    name: {
                      kind: 'Name',
                      value: 'id',
                    },
                    arguments: [],
                    directives: [],
                  },
                ],
              },
            },
          ],
        })
    }
  }

  public async buildTemplateFragments(
    template: Template<true>
  ): Promise<InlineFragmentNode> {
    const selections = []

    await sequential(template.fields || [], async (item) => {
      const field = await this._buildFieldNodeForFragments(item)
      selections.push(field)
    })
    return astBuilder.InlineFragmentDefinition({
      selections: filterSelections(selections),
      name: NAMER.dataTypeName(template.namespace),
    })
  }

  /**
   * ```graphql
   * # ex.
   * mutation {
   *   updatePostDocument(relativePath: $relativePath, params: $params) {
   *     id
   *     data {...}
   *   }
   * }
   * ```
   *
   * @param collection
   */
  public updateCollectionDocumentMutation = async (
    collection: TinaCloudCollectionEnriched
  ) => {
    return astBuilder.FieldDefinition({
      type: await this._buildCollectionDocumentType(collection),
      name: NAMER.updateName([collection.name]),
      required: true,
      args: [
        astBuilder.InputValueDefinition({
          name: 'relativePath',
          required: true,
          type: astBuilder.TYPES.String,
        }),
        astBuilder.InputValueDefinition({
          name: 'params',
          required: true,
          type: await this._updateCollectionDocumentMutationType(collection),
        }),
      ],
    })
  }

  /**
   * ```graphql
   * # ex.
   * mutation {
   *   createPostDocument(relativePath: $relativePath, params: $params) {
   *     id
   *     data {...}
   *   }
   * }
   * ```
   *
   * @param collection
   */
  public createCollectionDocumentMutation = async (
    collection: TinaCloudCollectionEnriched
  ) => {
    return astBuilder.FieldDefinition({
      type: await this._buildCollectionDocumentType(collection),
      name: NAMER.createName([collection.name]),
      required: true,
      args: [
        astBuilder.InputValueDefinition({
          name: 'relativePath',
          required: true,
          type: astBuilder.TYPES.String,
        }),
        astBuilder.InputValueDefinition({
          name: 'params',
          required: true,
          type: await this._updateCollectionDocumentMutationType(collection),
        }),
      ],
    })
  }

  /**
   * ```graphql
   * # ex.
   * {
   *   getPostList(first: 10) {
   *     edges {
   *       node {
   *         id
   *       }
   *     }
   *   }
   * }
   * ```
   *
   * @param collection
   */
  public collectionDocumentList = async (
    collection: TinaCloudCollectionEnriched
  ) => {
    const connectionName = NAMER.referenceConnectionType(collection.namespace)

    await this.database.addToLookupMap({
      type: connectionName,
      resolveType: 'collectionDocumentList' as const,
      collection: collection.name,
    })
    return this._connectionFieldBuilder({
      fieldName: NAMER.generateQueryListName(collection.namespace),
      connectionName,
      nodeType: NAMER.documentTypeName(collection.namespace),
      namespace: collection.namespace,
    })
  }

  /**
   * GraphQL type definitions which remain unchanged regardless
   * of the supplied Tina schema. Ex. "node" interface
   */
  public buildStaticDefinitions = () => staticDefinitions

  private _buildCollectionDocumentType = async (
    collection: TinaCloudCollectionEnriched
  ) => {
    const documentTypeName = NAMER.documentTypeName(collection.namespace)
    return astBuilder.ObjectTypeDefinition({
      name: documentTypeName,
      interfaces: [
        astBuilder.NamedType({ name: astBuilder.TYPES.Node }),
        astBuilder.NamedType({ name: astBuilder.TYPES.Document }),
      ],
      fields: [
        astBuilder.FieldDefinition({
          name: 'id',
          required: true,
          type: astBuilder.TYPES.ID,
        }),
        astBuilder.FieldDefinition({
          name: 'sys',
          required: true,
          type: astBuilder.TYPES.SystemInfo,
        }),
        // astBuilder.FieldDefinition({
        //   name: "collection",
        //   required: true,
        //   type: NAMER.collectionTypeName(collection.namespace),
        // }),
        astBuilder.FieldDefinition({
          name: 'data',
          required: true,
          type: await this._buildObjectOrUnionData(
            this.tinaSchema.getTemplatesForCollectable(collection)
          ),
        }),
        astBuilder.FieldDefinition({
          name: 'form',
          required: true,
          type: 'JSON',
        }),
        astBuilder.FieldDefinition({
          name: 'values',
          required: true,
          type: 'JSON',
        }),
        astBuilder.FieldDefinition({
          name: 'dataJSON',
          required: true,
          type: 'JSON',
        }),
      ],
    })
  }

  private _updateCollectionDocumentMutationType = async (
    collection: Collectable
  ): Promise<InputObjectTypeDefinitionNode> => {
    const t = this.tinaSchema.getTemplatesForCollectable(collection)
    if (t.type === 'union') {
      return astBuilder.InputObjectTypeDefinition({
        name: NAMER.dataMutationTypeName(t.namespace),
        fields: await sequential(t.templates, async (template) => {
          return astBuilder.InputValueDefinition({
            name: template.namespace[template.namespace.length - 1],
            type: await this._buildTemplateMutation(template),
          })
        }),
      })
    }

    return this._buildTemplateMutation(t.template)
  }

  private _buildTemplateMutation = async (template: Templateable) => {
    return astBuilder.InputObjectTypeDefinition({
      name: NAMER.dataMutationTypeName(template.namespace),
      fields: await sequential(template.fields, (field) => {
        return this._buildFieldMutation(field)
      }),
    })
  }

  private _buildMultiCollectionDocumentDefinition = async ({
    fieldName,
    collections,
  }: {
    fieldName: string
    collections: TinaCloudCollectionEnriched[]
  }) => {
    const types = collections.map((collection) => {
      const typeName = NAMER.documentTypeName(collection.namespace)
      return typeName
    })
    const type = astBuilder.UnionTypeDefinition({
      name: fieldName,
      types,
    })

    await this.database.addToLookupMap({
      type: type.name.value,
      resolveType: 'multiCollectionDocument',
      createDocument: 'create',
      updateDocument: 'update',
    })
    return type
  }

  private _buildMultiCollectionDocumentListDefinition = async ({
    fieldName,
    namespace,
    nodeType,
    collections,
    connectionNamespace,
  }: {
    fieldName: string
    namespace: string[]
    nodeType: string | TypeDefinitionNode
    collections: TinaCloudCollectionEnriched[]
    connectionNamespace: string[]
  }) => {
    const connectionName = NAMER.referenceConnectionType(namespace)
    await this.database.addToLookupMap({
      type: connectionName,
      resolveType: 'multiCollectionDocumentList' as const,
      collections: collections.map((collection) => collection.name),
    })

    return this._connectionFieldBuilder({
      fieldName,
      namespace: connectionNamespace,
      connectionName,
      nodeType: nodeType,
    })
  }

  private _buildFieldMutation = async (field: TinaFieldEnriched) => {
    switch (field.type) {
      case 'boolean':
        return astBuilder.InputValueDefinition({
          name: field.name,
          list: field.list,
          type: astBuilder.TYPES.Boolean,
        })
      case 'number':
        return astBuilder.InputValueDefinition({
          name: field.name,
          list: field.list,
          type: astBuilder.TYPES.Number,
        })
      case 'datetime':
      case 'image':
      case 'string':
        return astBuilder.InputValueDefinition({
          name: field.name,
          list: field.list,
          type: astBuilder.TYPES.String,
        })
      case 'object':
        return astBuilder.InputValueDefinition({
          name: field.name,
          list: field.list,
          type: await this._updateCollectionDocumentMutationType(field),
        })
      case 'rich-text':
        return astBuilder.InputValueDefinition({
          name: field.name,
          list: field.list,
          type: astBuilder.TYPES.JSON,
        })
      case 'reference':
        return astBuilder.InputValueDefinition({
          name: field.name,
          list: field.list,
          type: astBuilder.TYPES.String,
        })
      // return astBuilder.InputValueDefinition({
      //   name: field.name,
      //   type: await this._buildReferenceMutation(field),
      // })
    }
  }

  private _buildReferenceMutation = async (field: {
    namespace: string[]
    collections: string[]
  }) => {
    return astBuilder.InputObjectTypeDefinition({
      name: NAMER.dataMutationTypeName(field.namespace),
      fields: await sequential(
        this.tinaSchema.getCollectionsByName(field.collections),
        async (collection) => {
          return astBuilder.InputValueDefinition({
            name: collection.name,
            type: NAMER.dataMutationTypeName([collection.name]),
          })
        }
      ),
    })
  }

  private _buildObjectOrUnionData = async (
    collectableTemplate: CollectionTemplateable
  ): Promise<UnionTypeDefinitionNode | ObjectTypeDefinitionNode> => {
    if (collectableTemplate.type === 'union') {
      const name = NAMER.dataTypeName(collectableTemplate.namespace)
      const typeMap: { [templateName: string]: string } = {}
      const types = await sequential(
        collectableTemplate.templates,
        async (template) => {
          const type = await this._buildTemplateData(template)
          typeMap[template.namespace[template.namespace.length - 1]] =
            type.name.value
          return type
        }
      )

      await this.database.addToLookupMap({
        type: name,
        resolveType: 'unionData',
        typeMap,
      })

      return astBuilder.UnionTypeDefinition({ name, types })
    }

    return this._buildTemplateData(collectableTemplate.template)
  }

  private _connectionFieldBuilder = async ({
    fieldName,
    namespace,
    connectionName,
    nodeType,
  }: {
    fieldName: string
    namespace: string[]
    connectionName: string
    nodeType: string | TypeDefinitionNode
  }) => {
    return astBuilder.FieldDefinition({
      name: fieldName,
      required: true,
      args: [...listArgs],
      type: astBuilder.ObjectTypeDefinition({
        name: connectionName,
        interfaces: [
          astBuilder.NamedType({ name: astBuilder.TYPES.Connection }),
        ],
        fields: [
          astBuilder.FieldDefinition({
            name: 'pageInfo',
            type: astBuilder.TYPES.PageInfo,
          }),
          astBuilder.FieldDefinition({
            name: 'totalCount',
            required: true,
            type: astBuilder.TYPES.Number,
          }),
          astBuilder.FieldDefinition({
            name: 'edges',
            list: true,
            type: astBuilder.ObjectTypeDefinition({
              name: NAMER.referenceConnectionEdgesTypeName(namespace),
              fields: [
                astBuilder.FieldDefinition({
                  name: 'cursor',
                  type: astBuilder.TYPES.String,
                }),
                astBuilder.FieldDefinition({ name: 'node', type: nodeType }),
              ],
            }),
          }),
        ],
      }),
    })
  }

  private _buildDataField = async (field: TinaFieldEnriched) => {
    const listWarningMsg = `
WARNING: The user interface for ${field.type} does not support \`list: true\`
Visit https://tina.io/docs/errors/ui-not-supported/ for more information

`

    switch (field.type) {
      case 'boolean':
      case 'datetime':
      case 'image':
      case 'number':
        if (field.list) {
          console.warn(listWarningMsg)
        }
      case 'string':
        return astBuilder.FieldDefinition({
          name: field.name,
          list: field.list,
          required: field.required,
          type: astBuilder.TYPES.Scalar(field.type),
        })
      case 'object':
        return astBuilder.FieldDefinition({
          name: field.name,
          list: field.list,
          required: field.required,
          type: await this._buildObjectOrUnionData(
            this.tinaSchema.getTemplatesForCollectable(field)
          ),
        })
      case 'rich-text':
        return astBuilder.FieldDefinition({
          name: field.name,
          list: field.list,
          required: field.required,
          type: astBuilder.TYPES.JSON,
        })
      case 'reference':
        const name = NAMER.documentTypeName(field.namespace)
        if (field.list) {
          console.warn(listWarningMsg)
          return this._buildMultiCollectionDocumentListDefinition({
            fieldName: field.name,
            namespace: field.namespace,
            nodeType: astBuilder.UnionTypeDefinition({
              name,
              types: field.collections.map((collectionName) =>
                NAMER.documentTypeName([collectionName])
              ),
            }),
            collections: this.tinaSchema.getCollectionsByName(
              field.collections
            ),
            connectionNamespace: field.namespace,
          })
        } else {
          const type = await this._buildMultiCollectionDocumentDefinition({
            fieldName: name,
            collections: this.tinaSchema.getCollectionsByName(
              field.collections
            ),
          })

          return astBuilder.FieldDefinition({
            name: field.name,
            required: field.required,
            list: false,
            type: type,
          })
        }
    }
  }

  private _buildTemplateData = async ({ namespace, fields }: Templateable) => {
    return astBuilder.ObjectTypeDefinition({
      name: NAMER.dataTypeName(namespace),
      fields: await sequential(fields, async (field) => {
        return this._buildDataField(field)
      }),
    })
  }
}

const listArgs = [
  astBuilder.InputValueDefinition({
    name: 'before',
    type: astBuilder.TYPES.String,
  }),
  astBuilder.InputValueDefinition({
    name: 'after',
    type: astBuilder.TYPES.String,
  }),
  astBuilder.InputValueDefinition({
    name: 'first',
    type: astBuilder.TYPES.Number,
  }),
  astBuilder.InputValueDefinition({
    name: 'last',
    type: astBuilder.TYPES.Number,
  }),
]

const filterSelections = (arr: any[]) => {
  return arr.filter(Boolean)
}
