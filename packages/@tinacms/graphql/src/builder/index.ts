/**

*/

import { LookupMapType } from '../database'
import { astBuilder, NAMER, SysFieldDefinition } from '../ast-builder'
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
  FieldDefinitionNode,
  NamedTypeNode,
} from 'graphql'

import type {
  Collection,
  TinaField,
  CollectionTemplateable,
  Collectable,
  Template,
} from '@tinacms/schema-tools'
import { TinaSchema } from '@tinacms/schema-tools'
import { mapUserFields } from '../auth/utils'

export const createBuilder = async ({
  tinaSchema,
}: {
  tinaSchema: TinaSchema
}) => {
  return new Builder({ tinaSchema: tinaSchema })
}

/**
 * The builder class is responsible for creating GraphQL AST definitions
 * for a given portion of the Tina schema. In some cases that will also mean
 * storing a reference to how we can resolve that type when we come across it.
 */
export class Builder {
  private maxDepth: number
  public tinaSchema: TinaSchema
  public lookupMap: Record<string, LookupMapType>
  constructor(
    public config: {
      tinaSchema: TinaSchema
    }
  ) {
    this.maxDepth =
      // @ts-ignore
      config?.tinaSchema.schema?.config?.client?.referenceDepth ?? 2
    this.tinaSchema = config.tinaSchema
    this.lookupMap = {}
  }

  private addToLookupMap = (lookup: LookupMapType) => {
    this.lookupMap[lookup.type] = lookup
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
    collections: Collection<true>[]
  ) => {
    const name = 'collection'
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
        includeFolderFilter: true,
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
          required: false,
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
    return astBuilder.FieldDefinition({
      type,
      name,
      args,
      required: true,
    })
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
    collections: Collection<true>[]
  ) => {
    const name = 'collections'
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

    this.addToLookupMap({
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
  public multiCollectionDocument = async (collections: Collection<true>[]) => {
    const name = 'document'
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
      includeFolderType: true,
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
    collections: Collection<true>[]
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
    collections: Collection<true>[]
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
          type: await this._buildUpdateDocumentMutationParams({
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
   *   deleteDocument(relativePath: $relativePath, params: $params) {
   *     id
   *     data {...}
   *   }
   * }
   * ```
   *
   * @param collections
   */
  public buildDeleteCollectionDocumentMutation = async (
    collections: Collection<true>[]
  ) => {
    return astBuilder.FieldDefinition({
      name: 'deleteDocument',
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
      ],
      required: true,
      type: astBuilder.TYPES.MultiCollectionDocument,
    })
  }
  /**
   * ```graphql
   * # ex.
   * {
   *   createFolder(folderName: $folderName, params: $params) {
   *     id
   *     data {...}
   *   }
   * }
   * ```
   *
   * @param collections
   */
  public buildCreateCollectionFolderMutation = async () => {
    return astBuilder.FieldDefinition({
      name: 'createFolder',
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
      ],
      required: true,
      type: astBuilder.TYPES.MultiCollectionDocument,
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
  public collectionDocument = async (collection: Collection<true>) => {
    const name = NAMER.queryName([collection.name])
    const type = await this._buildCollectionDocumentType(collection)
    const args = [
      astBuilder.InputValueDefinition({
        name: 'relativePath',
        type: astBuilder.TYPES.String,
      }),
    ]
    this.addToLookupMap({
      type: type.name.value,
      resolveType: 'collectionDocument',
      collection: collection.name,
      [NAMER.createName([collection.name])]: 'create',
      [NAMER.updateName([collection.name])]: 'update',
    })
    return astBuilder.FieldDefinition({
      type,
      name,
      args,
      required: true,
    })
  }

  public authenticationCollectionDocument = async (
    collection: Collection<true>
  ) => {
    const name = 'authenticate'
    const type = await this._buildAuthDocumentType(collection)
    const args = [
      astBuilder.InputValueDefinition({
        name: 'sub',
        type: astBuilder.TYPES.String,
        required: true,
      }),
      astBuilder.InputValueDefinition({
        name: 'password',
        type: astBuilder.TYPES.String,
        required: true,
      }),
    ]
    return astBuilder.FieldDefinition({ type, name, args, required: false })
  }

  public updatePasswordMutation = async (collection: Collection<true>) => {
    return astBuilder.FieldDefinition({
      type: astBuilder.TYPES.Boolean,
      name: 'updatePassword',
      required: true,
      args: [
        astBuilder.InputValueDefinition({
          name: 'password',
          required: true,
          type: astBuilder.TYPES.String,
        }),
      ],
    })
  }

  public authorizationCollectionDocument = async (
    collection: Collection<true>
  ) => {
    const name = 'authorize'
    const type = await this._buildAuthDocumentType(collection)
    const args = []
    return astBuilder.FieldDefinition({ type, name, args, required: false })
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
  public collectionFragment = async (collection: Collection<true>) => {
    const name = NAMER.dataTypeName(collection.namespace)
    const fragmentName = NAMER.fragmentName(collection.namespace)
    const selections = await this._getCollectionFragmentSelections(
      collection,
      0
    )

    return astBuilder.FragmentDefinition({
      name,
      fragmentName,
      selections: filterSelections(selections),
    })
  }

  /**
   * Given a collection this function returns its selections set. For example for Post this would return
   *
   * "
   * body
   * title
   * ... on Author {
   *   name
   *   heroImg
   * }
   *
   * But in the AST format
   *
   * */
  private _getCollectionFragmentSelections = async (
    collection: Collection<true>,
    depth: number
  ) => {
    const selections = []
    selections.push({
      name: { kind: 'Name', value: '__typename' },
      kind: 'Field',
    })
    if (collection.fields?.length > 0) {
      await sequential(collection.fields, async (x) => {
        const field = await this._buildFieldNodeForFragments(x, depth)
        selections.push(field)
      })
    } else {
      await sequential(collection.templates, async (tem) => {
        if (typeof tem === 'object') {
          // TODO: Handle when template is a string
          selections.push(await this.buildTemplateFragments(tem, depth))
        }
      })
    }
    return selections
  }

  private _buildFieldNodeForFragments: (
    field: TinaField<true>,
    depth: number
  ) => Promise<SelectionSetNode | FieldNode | false> = async (field, depth) => {
    switch (field.type) {
      case 'string':
      case 'image':
      case 'datetime':
      case 'number':
      case 'boolean':
      case 'rich-text':
        return astBuilder.FieldNodeDefinition(field)
      case 'password':
        const passwordValue = await this._buildFieldNodeForFragments(
          {
            name: 'value',
            namespace: [...field.namespace, 'value'],
            type: 'string',
            required: true,
          } as TinaField<true>,
          depth
        )
        const passwordChangeRequired = await this._buildFieldNodeForFragments(
          {
            name: 'passwordChangeRequired',
            namespace: [...field.namespace, 'passwordChangeRequired'],
            type: 'boolean',
            required: false,
          },
          depth
        )
        return astBuilder.FieldWithSelectionSetDefinition({
          name: field.name,
          selections: filterSelections([passwordValue, passwordChangeRequired]),
        })
      case 'object':
        if (field.fields?.length > 0) {
          const selections = []
          await sequential(field.fields, async (item) => {
            const field = await this._buildFieldNodeForFragments(item, depth)
            selections.push(field)
          })

          return astBuilder.FieldWithSelectionSetDefinition({
            name: field.name,
            selections: [
              { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
              ...filterSelections(selections),
            ],
          })
        } else if (field.templates?.length > 0) {
          const selections = []
          await sequential(field.templates, async (tem) => {
            if (typeof tem === 'object') {
              // TODO: Handle when template is a string
              selections.push(await this.buildTemplateFragments(tem, depth))
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
      // TODO: Should we throw here?
      case 'reference':
        if (depth >= this.maxDepth) return false

        if (!('collections' in field)) {
          // todo add an error
          return false
        }
        const selections = []

        await sequential(field.collections, async (col) => {
          const collection = this.tinaSchema.getCollection(col)

          selections.push({
            kind: 'InlineFragment',
            typeCondition: {
              kind: 'NamedType',
              name: {
                kind: 'Name',
                value: NAMER.documentTypeName(collection.namespace),
              },
            },
            directives: [],
            selectionSet: {
              kind: 'SelectionSet',
              selections: filterSelections(
                await this._getCollectionFragmentSelections(
                  collection,
                  depth + 1
                )
              ),
            },
          })
        })

        return astBuilder.FieldWithSelectionSetDefinition({
          name: field.name,
          selections: [
            ...selections,
            // This is ... on Document { id }
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
                  SysFieldDefinition,
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
    template: Template<true>,
    depth: number
  ): Promise<InlineFragmentNode | boolean> {
    const selections = []

    await sequential(template.fields || [], async (item) => {
      const field = await this._buildFieldNodeForFragments(item, depth)
      selections.push(field)
    })
    const filteredSelections = filterSelections(selections)
    if (!filteredSelections.length) return false
    return astBuilder.InlineFragmentDefinition({
      selections: filteredSelections,
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
    collection: Collection<true>
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
    collection: Collection<true>
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
  public collectionDocumentList = async (collection: Collection<true>) => {
    const connectionName = NAMER.referenceConnectionType(collection.namespace)

    this.addToLookupMap({
      type: connectionName,
      resolveType: 'collectionDocumentList' as const,
      collection: collection.name,
    })
    return this._connectionFieldBuilder({
      fieldName: NAMER.generateQueryListName(collection.namespace),
      connectionName,
      nodeType: NAMER.documentTypeName(collection.namespace),
      namespace: collection.namespace,
      collection,
    })
  }

  public reverseCollectionDocumentList = async (
    collection: Collection<true>
  ) => {
    const connectionName = NAMER.reverseReferenceConnectionType(
      collection.namespace
    )

    this.addToLookupMap({
      type: connectionName,
      resolveType: 'reverseCollectionDocumentList' as const,
      collection: collection.name,
    })
    return this._connectionFieldBuilder({
      fieldName: NAMER.generateReverseQueryListName(collection.namespace),
      connectionName,
      nodeType: NAMER.documentTypeName(collection.namespace),
      namespace: collection.namespace,
      collection,
    })
  }

  /**
   * GraphQL type definitions which remain unchanged regardless
   * of the supplied Tina schema. Ex. "node" interface
   */
  public buildStaticDefinitions = () => staticDefinitions

  private _buildCollectionDocumentType = async (
    collection: Collection<true>,
    suffix: string = '',
    extraFields: FieldDefinitionNode[] = [],
    extraInterfaces: NamedTypeNode[] = []
  ) => {
    const documentTypeName = NAMER.documentTypeName(collection.namespace)

    const templateInfo = this.tinaSchema.getTemplatesForCollectable(collection)
    if (templateInfo.type === 'union') {
      return this._buildObjectOrUnionData(
        {
          ...templateInfo,
        },
        [
          astBuilder.FieldDefinition({
            name: 'id',
            required: true,
            type: astBuilder.TYPES.ID,
          }),
          astBuilder.FieldDefinition({
            name: '_sys',
            required: true,
            type: astBuilder.TYPES.SystemInfo,
          }),
          ...extraFields,
          astBuilder.FieldDefinition({
            name: '_values',
            required: true,
            type: 'JSON',
          }),
        ],
        [
          astBuilder.NamedType({ name: astBuilder.TYPES.Node }),
          astBuilder.NamedType({ name: astBuilder.TYPES.Document }),
          ...extraInterfaces,
        ],
        collection
      )
    }
    const fields = templateInfo.template.fields
    const templateFields = await sequential(fields, async (field) => {
      return this._buildDataField(field)
    })
    const others = []
    for (const c of Object.keys(
      this.tinaSchema.findReferences(collection.name)
    )) {
      const refCollection = this.tinaSchema.getCollection(c)
      if (!refCollection) {
        throw new Error(`Collection ${c} not found`)
      }
      const refTypeName = NAMER.reverseReferenceConnectionType(
        refCollection.namespace
      )
      // add a list of references
      others.push(
        astBuilder.FieldDefinition({
          name: refCollection.name,
          required: false,
          type: refTypeName,
          list: false,
        })
      )
    }
    return astBuilder.ObjectTypeDefinition({
      name: documentTypeName + suffix,
      interfaces: [
        astBuilder.NamedType({ name: astBuilder.TYPES.Node }),
        astBuilder.NamedType({ name: astBuilder.TYPES.Document }),
        ...extraInterfaces,
      ],
      fields: [
        ...templateFields,
        astBuilder.FieldDefinition({
          name: 'id',
          required: true,
          type: astBuilder.TYPES.ID,
        }),
        ...others,
        astBuilder.FieldDefinition({
          name: '_sys',
          required: true,
          type: astBuilder.TYPES.SystemInfo,
        }),
        ...extraFields,
        astBuilder.FieldDefinition({
          name: '_values',
          required: true,
          type: 'JSON',
        }),
      ],
    })
  }

  private _buildAuthDocumentType = async (
    collection: Collection<true>,
    suffix: string = '',
    extraFields: FieldDefinitionNode[] = [],
    extraInterfaces: NamedTypeNode[] = []
  ) => {
    const usersFields = mapUserFields(collection, [])
    if (!usersFields.length) {
      throw new Error('Auth collection must have a user field')
    }
    if (usersFields.length > 1) {
      throw new Error('Auth collection cannot have more than one user field')
    }
    const usersField = usersFields[0].collectable
    const documentTypeName = NAMER.documentTypeName(usersField.namespace)
    const templateInfo = this.tinaSchema.getTemplatesForCollectable(usersField)

    if (templateInfo.type === 'union') {
      throw new Error('Auth collection user field cannot be a union')
    }
    const fields = templateInfo.template.fields
    const templateFields = await sequential(fields, async (field) => {
      return this._buildDataField(field)
    })
    return astBuilder.ObjectTypeDefinition({
      name: documentTypeName + suffix,
      interfaces: [
        astBuilder.NamedType({ name: astBuilder.TYPES.Node }),
        astBuilder.NamedType({ name: astBuilder.TYPES.Document }),
        ...extraInterfaces,
      ],
      fields: [...templateFields],
    })
  }

  private _filterCollectionDocumentType = async (
    collection: Collectable
  ): Promise<InputObjectTypeDefinitionNode> => {
    const t = this.tinaSchema.getTemplatesForCollectable(collection)
    if (t.type === 'union') {
      return astBuilder.InputObjectTypeDefinition({
        name: NAMER.dataFilterTypeName(t.namespace),
        fields: await sequential(t.templates, async (template) => {
          return astBuilder.InputValueDefinition({
            name: template.namespace[template.namespace.length - 1],
            type: await this._buildTemplateFilter(template),
          })
        }),
      })
    }

    return this._buildTemplateFilter(t.template)
  }

  private _buildTemplateFilter = async (template: Template<true>) => {
    const fields = []
    await sequential(template.fields, async (field) => {
      const f = await this._buildFieldFilter(field)
      if (f) {
        fields.push(f)
      }
      return true
    })
    return astBuilder.InputObjectTypeDefinition({
      name: NAMER.dataFilterTypeName(template.namespace),
      fields: fields,
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

  private _buildTemplateMutation = async (template: Template<true>) => {
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
    includeFolderType,
  }: {
    fieldName: string
    collections: Collection<true>[]
    includeFolderType?: boolean
  }) => {
    const types: string[] = []
    collections.forEach((collection) => {
      if (collection.fields) {
        const typeName = NAMER.documentTypeName(collection.namespace)
        types.push(typeName)
      }
      if (collection.templates) {
        collection.templates.forEach((template) => {
          const typeName = NAMER.documentTypeName(template.namespace)
          types.push(typeName)
        })
      }
    })
    if (includeFolderType) {
      types.push(astBuilder.TYPES.Folder)
    }
    const type = astBuilder.UnionTypeDefinition({
      name: fieldName,
      types,
    })

    this.addToLookupMap({
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
    includeFolderFilter,
  }: {
    fieldName: string
    namespace: string[]
    nodeType: string | TypeDefinitionNode
    collections: Collection<true>[]
    connectionNamespace: string[]
    includeFolderFilter?: boolean
  }) => {
    const connectionName = NAMER.referenceConnectionType(namespace)
    this.addToLookupMap({
      type: connectionName,
      resolveType: 'multiCollectionDocumentList' as const,
      collections: collections.map((collection) => collection.name),
    })

    return this._connectionFieldBuilder({
      fieldName,
      namespace: connectionNamespace,
      connectionName,
      nodeType: nodeType,
      collections,
      includeFolderFilter,
    })
  }

  private _buildFieldFilter = async (field: TinaField<true>) => {
    switch (field.type) {
      case 'boolean':
        return astBuilder.InputValueDefinition({
          name: field.name,
          type: astBuilder.InputObjectTypeDefinition({
            name: NAMER.dataFilterTypeName([field.type]),
            fields: [
              astBuilder.InputValueDefinition({
                name: 'eq',
                type: astBuilder.TYPES.Boolean,
              }),
              astBuilder.InputValueDefinition({
                name: 'exists',
                type: astBuilder.TYPES.Boolean,
              }),
            ],
          }),
        })
      case 'number':
        return astBuilder.InputValueDefinition({
          name: field.name,
          type: astBuilder.InputObjectTypeDefinition({
            name: NAMER.dataFilterTypeName([field.type]),
            fields: [
              astBuilder.InputValueDefinition({
                name: 'lt',
                type: astBuilder.TYPES.Number,
              }),
              astBuilder.InputValueDefinition({
                name: 'lte',
                type: astBuilder.TYPES.Number,
              }),
              astBuilder.InputValueDefinition({
                name: 'gte',
                type: astBuilder.TYPES.Number,
              }),
              astBuilder.InputValueDefinition({
                name: 'gt',
                type: astBuilder.TYPES.Number,
              }),
              astBuilder.InputValueDefinition({
                name: 'eq',
                type: astBuilder.TYPES.Number,
              }),
              astBuilder.InputValueDefinition({
                name: 'exists',
                type: astBuilder.TYPES.Boolean,
              }),
              astBuilder.InputValueDefinition({
                name: 'in',
                type: astBuilder.TYPES.Number,
                list: true,
              }),
            ],
          }),
        })
      case 'datetime':
        return astBuilder.InputValueDefinition({
          name: field.name,
          type: astBuilder.InputObjectTypeDefinition({
            name: NAMER.dataFilterTypeName([field.type]),
            fields: [
              astBuilder.InputValueDefinition({
                name: 'after',
                type: astBuilder.TYPES.String,
              }),
              astBuilder.InputValueDefinition({
                name: 'before',
                type: astBuilder.TYPES.String,
              }),
              astBuilder.InputValueDefinition({
                name: 'eq',
                type: astBuilder.TYPES.String,
              }),
              astBuilder.InputValueDefinition({
                name: 'exists',
                type: astBuilder.TYPES.Boolean,
              }),
              astBuilder.InputValueDefinition({
                name: 'in',
                type: astBuilder.TYPES.String,
                list: true,
              }),
            ],
          }),
        })
      case 'image':
      case 'string':
        return astBuilder.InputValueDefinition({
          name: field.name,
          type: astBuilder.InputObjectTypeDefinition({
            name: NAMER.dataFilterTypeName([field.type]),
            fields: [
              astBuilder.InputValueDefinition({
                name: 'startsWith',
                type: astBuilder.TYPES.String,
              }),
              astBuilder.InputValueDefinition({
                name: 'eq',
                type: astBuilder.TYPES.String,
              }),
              astBuilder.InputValueDefinition({
                name: 'exists',
                type: astBuilder.TYPES.Boolean,
              }),
              astBuilder.InputValueDefinition({
                name: 'in',
                type: astBuilder.TYPES.String,
                list: true,
              }),
            ],
          }),
        })
      case 'object':
        return astBuilder.InputValueDefinition({
          name: field.name,
          type: await this._filterCollectionDocumentType(field),
        })
      case 'rich-text':
        if (!field.templates || field.templates.length === 0) {
          return astBuilder.InputValueDefinition({
            name: field.name,
            type: astBuilder.InputObjectTypeDefinition({
              name: NAMER.dataFilterTypeName(['richText']),
              fields: [
                astBuilder.InputValueDefinition({
                  name: 'startsWith',
                  type: astBuilder.TYPES.String,
                }),
                astBuilder.InputValueDefinition({
                  name: 'eq',
                  type: astBuilder.TYPES.String,
                }),
                astBuilder.InputValueDefinition({
                  name: 'exists',
                  type: astBuilder.TYPES.Boolean,
                }),
              ],
            }),
          })
        }
        return astBuilder.InputValueDefinition({
          name: field.name,
          type: await this._filterCollectionDocumentType(field),
        })
      case 'reference':
        const filter = await this._connectionFilterBuilder({
          fieldName: field.name,
          namespace: field.namespace,
          collections: this.tinaSchema.getCollectionsByName(field.collections),
        })
        return astBuilder.InputValueDefinition({
          name: field.name,
          type: astBuilder.InputObjectTypeDefinition({
            name: NAMER.dataFilterTypeName(field.namespace),
            fields: [filter],
          }),
        })
    }
  }

  private _buildFieldMutation = async (field: TinaField<true>) => {
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
      case 'password':
        return this._buildPasswordMutation(field)
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

  private _buildPasswordMutation = async (field: {
    list?: boolean
    name: string
    namespace: string[]
  }) => {
    return astBuilder.InputValueDefinition({
      name: field.name,
      list: field.list,
      type: astBuilder.InputObjectTypeDefinition({
        name: NAMER.dataMutationTypeName(field.namespace),
        fields: [
          astBuilder.InputValueDefinition({
            name: 'value',
            type: astBuilder.TYPES.String,
            required: false,
          }),
          astBuilder.InputValueDefinition({
            name: 'passwordChangeRequired',
            type: astBuilder.TYPES.Boolean,
            required: true,
          }),
        ],
      }),
    })
  }

  private _buildUpdateDocumentMutationParams = async (field: {
    namespace: string[]
    collections: string[]
  }) => {
    const fields = await sequential(
      this.tinaSchema.getCollectionsByName(field.collections),
      async (collection) => {
        return astBuilder.InputValueDefinition({
          name: collection.name,
          type: NAMER.dataMutationTypeName([collection.name]),
        })
      }
    )
    fields.push(
      astBuilder.InputValueDefinition({
        name: 'relativePath',
        type: astBuilder.TYPES.String,
      })
    )
    return astBuilder.InputObjectTypeDefinition({
      name: NAMER.dataMutationUpdateTypeName(field.namespace),
      fields,
    })
  }

  private _buildObjectOrUnionData = async (
    collectableTemplate: CollectionTemplateable,
    extraFields = [],
    extraInterfaces = [],
    collection?: Collection<true>
  ): Promise<UnionTypeDefinitionNode | ObjectTypeDefinitionNode> => {
    if (collectableTemplate.type === 'union') {
      const name = NAMER.dataTypeName(collectableTemplate.namespace)
      const typeMap: { [templateName: string]: string } = {}
      const types = await sequential(
        collectableTemplate.templates,
        async (template) => {
          const type = await this._buildTemplateData(
            template,
            extraFields,
            extraInterfaces
          )
          typeMap[template.namespace[template.namespace.length - 1]] =
            type.name.value
          return type
        }
      )

      this.addToLookupMap({
        type: name,
        resolveType: 'unionData',
        collection: collection?.name,
        typeMap,
      })

      return astBuilder.UnionTypeDefinition({ name, types })
    }

    return this._buildTemplateData(collectableTemplate.template)
  }

  private _connectionFilterBuilder = async ({
    fieldName,
    namespace,
    collection,
    collections,
  }: {
    fieldName: string
    namespace: string[]
    collection?: Collectable
    collections?: Collectable[]
  }) => {
    let filter
    if (collections) {
      filter = astBuilder.InputValueDefinition({
        name: 'filter',
        type: astBuilder.InputObjectTypeDefinition({
          name: NAMER.dataFilterTypeName(namespace),
          fields: await sequential(collections, async (collection) => {
            return astBuilder.InputValueDefinition({
              // @ts-ignore
              name: collection.name,
              type: NAMER.dataFilterTypeName(collection.namespace),
            })
          }),
        }),
      })
    } else if (collection) {
      filter = astBuilder.InputValueDefinition({
        name: 'filter',
        type: await this._filterCollectionDocumentType(collection),
      })
    } else {
      throw new Error(
        `Must provide either collection or collections to filter field builder`
      )
    }
    return filter
  }

  private _connectionFieldBuilder = async ({
    fieldName,
    namespace,
    connectionName,
    nodeType,
    collection,
    collections,
    includeFolderFilter,
  }: {
    fieldName: string
    namespace: string[]
    connectionName: string
    nodeType: string | TypeDefinitionNode
    collection?: Collectable
    collections?: Collectable[]
    includeFolderFilter?: boolean
  }) => {
    const extra = [
      await this._connectionFilterBuilder({
        fieldName,
        namespace,
        collection,
        collections,
      }),
    ]
    if (includeFolderFilter) {
      extra.push(
        astBuilder.InputValueDefinition({
          name: 'folder',
          type: astBuilder.TYPES.String,
        })
      )
    }
    return astBuilder.FieldDefinition({
      name: fieldName,
      required: true,
      args: [...listArgs, ...extra],
      type: astBuilder.ObjectTypeDefinition({
        name: connectionName,
        interfaces: [
          astBuilder.NamedType({ name: astBuilder.TYPES.Connection }),
        ],
        fields: [
          astBuilder.FieldDefinition({
            name: 'pageInfo',
            required: true,
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
                  required: true,
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

  private _buildDataField = async (field: TinaField<true>) => {
    const listWarningMsg = `
WARNING: The user interface for ${field.type} does not support \`list: true\`
Visit https://tina.io/docs/errors/ui-not-supported/ for more information

`

    switch (field.type) {
      case 'boolean':
      case 'datetime':
      case 'number':
        if (field.list) {
          console.warn(listWarningMsg)
        }
      case 'image':
      case 'string':
        return astBuilder.FieldDefinition({
          name: field.name,
          list: field.list,
          required: field.required,
          type: astBuilder.TYPES.Scalar(field.type),
        })
      case 'password':
        return astBuilder.FieldDefinition({
          name: field.name,
          list: field.list,
          required: field.required,
          type: astBuilder.ObjectTypeDefinition({
            name: NAMER.dataTypeName(field.namespace),
            fields: [
              await this._buildDataField({
                name: 'value',
                namespace: [...field.namespace, 'value'],
                type: 'string',
                required: true,
              }),
              await this._buildDataField({
                name: 'passwordChangeRequired',
                namespace: [...field.namespace, 'passwordChangeRequired'],
                type: 'boolean',
                required: false,
              }),
            ],
          }),
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

  private _buildTemplateData = async (
    { namespace, fields }: Template<true>,
    extraFields = [],
    extraInterfaces = []
  ) => {
    return astBuilder.ObjectTypeDefinition({
      name: NAMER.dataTypeName(namespace),
      interfaces: extraInterfaces || [],
      fields: [
        ...(await sequential(fields, async (field) => {
          return this._buildDataField(field)
        })),
        ...extraFields,
      ],
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
  astBuilder.InputValueDefinition({
    name: 'sort',
    type: astBuilder.TYPES.String,
  }),
]

const filterSelections = (arr: any[]) => {
  return arr.filter(Boolean)
}
