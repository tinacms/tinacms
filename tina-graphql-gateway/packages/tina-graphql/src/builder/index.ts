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
import { templateTypeName, friendlyName } from 'tina-graphql-helpers'
import { gql } from '../gql'
import { sequential } from '../util'

import { template } from '../fields/templates'

import {
  DocumentNode,
  UnionTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  EnumTypeDefinitionNode,
  InputObjectTypeDefinitionNode,
  ScalarTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
} from 'graphql'
import type { DirectorySection, Section } from '../types'
import type { Cache } from '../cache'

/**
 *
 * ### Schema Builder
 *
 * Build the schema for a given app, this is the main entrypoint into the
 * build process, it generates a schema based on the `.tina` configuration. The schema can be
 * printed and cached for use as well as a mapping object which adds some information to
 * query fields which will be passed through the resolver functions.
 *
 * For example, given a `Posts` collection, it's possibe for the user to query
 * `getPostsDocument` - however when we receive that query it's not clear to us
 * that the resolver should only resolve documents for the `Posts` collection, the
 * sectionMap helps with that:
 *
 * ```json
 *  {
 *    "getPostsDocument": {
 *      "collection": {
 *        "slug": "posts"
 *        ...
 *      },
 *      "plural": false,
 *      "queryName": "getPostsDocument",
 *      "returnType": "Posts_Document"
 *    },
 *  }
 * ```
 */
export const schemaBuilder = async ({ cache }: { cache: Cache }) => {
  const sectionMap: sectionMap = {}
  const mutationsArray: mutationsArray = []

  let sections: DirectorySection[]

  try {
    sections = await cache.datasource.getCollectionsSettings()
  } catch (e) {
    // This error will happen if the schema.ts is not on github
    console.log(
      '.tina/schema.ts not found or is malformed, please create this file and commit it to Github. Documentation; https://tina.io/docs/tina-cloud/cli/#getting-started'
    )
    throw e
  }

  sections.forEach((section) => {
    buildSectionMap(section, mutationsArray, sectionMap)
  })

  const accumulator: Definitions[] = [
    ...interfaceDefinitions,
    ...scalarDefinitions,
    systemInfoDefinition,
    sectionDefinition,
    gql.UnionTypeDefinition({
      name: 'SectionDocumentUnion',
      types: sections.map((section) =>
        friendlyName(section.slug, { suffix: 'Document' })
      ),
    }),
    ...mutationDefinitions(mutationsArray),
    queryDefinition(sectionMap),
  ]

  await sequential(
    sections.filter((section) => section.type === 'directory'),
    async (section) => {
      buildSectionDefinitions(section, accumulator)
      await sequential(section.templates, async (templateSlug) => {
        const args = {
          cache,
          template: await cache.datasource.getTemplate(templateSlug),
          accumulator,
          includeBody: true,
        }

        await template.build.data(args)
        await template.build.values(args)
        await template.build.form(args)
        await template.build.input(args)
      })
    }
  )

  const schema: DocumentNode = {
    kind: 'Document',
    definitions: _.uniqBy(accumulator, (field) => field.name.value),
  }

  return { schema, sectionMap }
}

/**
 * Definitions for static interfaces which are identical
 * for any schema, ex. Node
 */
const interfaceDefinitions = [
  gql.InterfaceTypeDefinition({
    name: 'Node',
    fields: [
      gql.FieldDefinition({ name: 'id', type: gql.TYPES.ID, required: true }),
    ],
  }),
  gql.InterfaceTypeDefinition({
    name: 'Document',
    fields: [
      gql.FieldDefinition({ name: 'sys', type: gql.TYPES.SystemInfo }),
      gql.FieldDefinition({ name: 'id', type: gql.TYPES.ID, required: true }),
    ],
  }),
  gql.InterfaceTypeDefinition({
    name: 'FormField',
    fields: [
      gql.FieldDefinition({ name: 'label', type: gql.TYPES.String }),
      gql.FieldDefinition({ name: 'name', type: gql.TYPES.String }),
      gql.FieldDefinition({ name: 'component', type: gql.TYPES.String }),
    ],
  }),
]

/**
 * Definitions for additional scalars, ex. JSON
 */
const scalarDefinitions = [
  gql.ScalarTypeDefinition({
    name: 'Reference',
    description: 'References another document, used as a foreign key',
  }),
  gql.ScalarTypeDefinition({ name: 'JSON' }),
  gql.ScalarTypeDefinition({ name: 'JSONObject' }),
  gql.ObjectTypeDefinition({
    name: 'SelectOption',
    fields: [
      gql.FieldDefinition({ name: 'label', type: gql.TYPES.String }),
      gql.FieldDefinition({ name: 'value', type: gql.TYPES.String }),
    ],
  }),
]

/**
 * System info provides information about a given document
 */
const systemInfoDefinition = gql.ObjectTypeDefinition({
  name: 'SystemInfo',
  fields: [
    gql.FieldDefinition({ name: 'filename', type: gql.TYPES.String }),
    gql.FieldDefinition({ name: 'basename', type: gql.TYPES.String }),
    gql.FieldDefinition({
      name: 'breadcrumbs',
      type: gql.TYPES.String,
      list: true,
      args: [
        gql.InputValueDefinition({
          name: 'excludeExtension',
          type: gql.TYPES.Boolean,
        }),
      ],
    }),
    gql.FieldDefinition({ name: 'path', type: gql.TYPES.String }),
    gql.FieldDefinition({ name: 'relativePath', type: gql.TYPES.String }),
    gql.FieldDefinition({ name: 'extension', type: gql.TYPES.String }),
    gql.FieldDefinition({ name: 'template', type: gql.TYPES.String }),
    gql.FieldDefinition({ name: 'collection', type: gql.TYPES.Section }),
  ],
})

const sectionDefinition = gql.ObjectTypeDefinition({
  name: 'Section',
  fields: [
    gql.FieldDefinition({ name: 'type', type: gql.TYPES.String }),
    gql.FieldDefinition({ name: 'path', type: gql.TYPES.String }),
    gql.FieldDefinition({ name: 'format', type: gql.TYPES.String }),
    gql.FieldDefinition({ name: 'label', type: gql.TYPES.String }),
    gql.FieldDefinition({ name: 'create', type: gql.TYPES.String }),
    gql.FieldDefinition({ name: 'match', type: gql.TYPES.String }),
    gql.FieldDefinition({ name: 'new_doc_ext', type: gql.TYPES.String }),
    gql.FieldDefinition({
      name: 'templates',
      type: gql.TYPES.String,
      list: true,
    }),
    gql.FieldDefinition({ name: 'slug', type: gql.TYPES.String }),
    gql.FieldDefinition({
      name: 'documents',
      type: gql.TYPES.Document,
      list: true,
    }),
  ],
})

const buildSectionMap = (
  section: DirectorySection,
  mutationsArray: mutationsArray,
  sectionMap: sectionMap
) => {
  const returnType = friendlyName(section.slug, { suffix: 'Document' })
  mutationsArray.push({
    section,
    mutationName: `update${friendlyName(section.slug)}Document`,
    returnType,
  })
  sectionMap[`update${friendlyName(section.slug)}Document`] = {
    section,
    plural: false,
    mutation: true,
    queryName: `update${friendlyName(section.slug)}Document`,
    returnType,
  }
  sectionMap[`get${friendlyName(section.slug)}Document`] = {
    section,
    plural: false,
    queryName: `get${friendlyName(section.slug)}Document`,
    returnType,
  }
  sectionMap[`get${friendlyName(section.slug)}List`] = {
    section,
    plural: true,
    queryName: `get${friendlyName(section.slug)}List`,
    returnType,
  }
}

/**
 * Given a list of mutation types, this will generate all possible
 * mutation definitions and argument definitions for a given schema. Ex. `Posts_Input`
 */
const mutationDefinitions = (mutationsArray: mutationsArray) => {
  return [
    gql.InputObjectTypeDefinition({
      name: 'SectionParams',
      fields: mutationsArray.map((ma) => {
        return gql.InputValueDefinition({
          name: ma.section.slug,
          type: friendlyName(ma.section.slug, { suffix: 'Input' }),
        })
      }),
    }),
    gql.ObjectTypeDefinition({
      name: 'Mutation',
      fields: [
        gql.FieldDefinition({
          name: 'addPendingDocument',
          type: gql.TYPES.Document,
          args: [
            gql.InputValueDefinition({
              name: 'relativePath',
              type: gql.TYPES.String,
            }),
            gql.InputValueDefinition({
              name: 'collection',
              type: gql.TYPES.String,
            }),
            gql.InputValueDefinition({
              name: 'template',
              type: gql.TYPES.String,
            }),
          ],
        }),
        gql.FieldDefinition({
          name: 'updateDocument',
          type: gql.TYPES.SectionDocumentUnion,
          args: [
            gql.InputValueDefinition({
              name: 'relativePath',
              type: gql.TYPES.String,
            }),
            gql.InputValueDefinition({
              name: 'params',
              type: gql.TYPES.SectionParams,
            }),
          ],
        }),
        ...mutationsArray.map((mutation) => {
          return gql.FieldDefinition({
            name: mutation.mutationName,
            type: mutation.returnType,
            args: [
              gql.InputValueDefinition({
                name: 'relativePath',
                type: gql.TYPES.String,
              }),
              gql.InputValueDefinition({
                name: 'params',
                type: friendlyName(mutation.section.slug, { suffix: 'Input' }),
              }),
            ],
          })
        }),
      ],
    }),
  ]
}

const queryDefinition = (sectionMap: sectionMap) => {
  return gql.ObjectTypeDefinition({
    name: 'Query',
    fields: [
      gql.FieldDefinition({
        name: 'node',
        type: gql.TYPES.Node,
        args: [
          gql.InputValueDefinition({
            name: 'id',
            type: gql.TYPES.ID,
            required: true,
          }),
        ],
      }),
      gql.FieldDefinition({
        name: 'getDocument',
        type: gql.TYPES.SectionDocumentUnion,
        args: [
          gql.InputValueDefinition({
            name: 'collection',
            type: gql.TYPES.String,
          }),
          gql.InputValueDefinition({
            name: 'relativePath',
            type: gql.TYPES.String,
          }),
        ],
      }),
      gql.FieldDefinition({
        name: 'getCollections',
        type: gql.TYPES.Section,
        list: true,
      }),
      gql.FieldDefinition({
        name: 'getCollection',
        type: gql.TYPES.Section,
        args: [
          gql.InputValueDefinition({
            name: 'collection',
            type: gql.TYPES.String,
          }),
        ],
      }),
      ...Object.values(sectionMap)
        .filter((section) => !section.mutation)
        .map((section) => {
          return section.plural
            ? gql.FieldDefinition({
                name: section.queryName,
                type: section.returnType,
                list: true,
                args: [],
              })
            : gql.FieldDefinition({
                name: section.queryName,
                type: section.returnType,
                args: [
                  gql.InputValueDefinition({
                    name: 'relativePath',
                    type: gql.TYPES.String,
                  }),
                ],
              })
        }),
    ],
  })
}

const buildSectionDefinitions = (
  section: DirectorySection,
  accumulator: Definitions[]
) => {
  const name = friendlyName(section.slug)
  accumulator.push(
    gql.UnionTypeDefinition({
      name: friendlyName(name, { suffix: 'Data' }),
      types: section.templates.map((template) =>
        templateTypeName(template, 'Data', true)
      ),
    })
  )
  accumulator.push(
    gql.InputObjectTypeDefinition({
      name: friendlyName(name, { suffix: 'Input' }),
      fields: section.templates.map((template) =>
        gql.InputValueDefinition({
          name: friendlyName(template, { lowerCase: true }),
          type: templateTypeName(template, 'Input', true),
        })
      ),
    })
  )
  accumulator.push(
    gql.UnionTypeDefinition({
      name: friendlyName(name, { suffix: 'Values' }),
      types: section.templates.map((template) =>
        templateTypeName(template, 'Values', true)
      ),
    })
  )
  accumulator.push(
    gql.UnionTypeDefinition({
      name: friendlyName(name, { suffix: 'Form' }),
      types: section.templates.map((template) =>
        templateTypeName(template, 'Form', true)
      ),
    })
  )
  accumulator.push(
    gql.ObjectTypeDefinition({
      name: friendlyName(name, { suffix: 'Document' }),
      interfaces: [
        gql.NamedType({ name: 'Node' }),
        gql.NamedType({ name: 'Document' }),
      ],
      fields: [
        gql.FieldDefinition({ name: 'id', type: gql.TYPES.ID, required: true }),
        gql.FieldDefinition({ name: 'sys', type: gql.TYPES.SystemInfo }),
        gql.FieldDefinition({
          name: 'data',
          type: friendlyName(name, { suffix: 'Data' }),
        }),
        gql.FieldDefinition({
          name: 'values',
          type: friendlyName(name, { suffix: 'Values' }),
        }),
        gql.FieldDefinition({
          name: 'form',
          type: friendlyName(name, { suffix: 'Form' }),
        }),
      ],
    })
  )
}

export type Definitions =
  | ObjectTypeDefinitionNode
  | UnionTypeDefinitionNode
  | InputObjectTypeDefinitionNode
  | ScalarTypeDefinitionNode
  | InterfaceTypeDefinitionNode
  | EnumTypeDefinitionNode

export type sectionMap = {
  [key: string]: {
    section: DirectorySection
    plural: boolean
    mutation?: boolean
    queryName: string
    returnType: string
  }
}
type mutationsArray = {
  section: Section
  mutationName: string
  returnType: string
}[]
