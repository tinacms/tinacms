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

import type * as G from 'graphql'

export type FormifiedDocumentNode = {
  id: string
  _internalSys: {
    path: string
    relativePath: string
    collection: {
      name
    }
  }
  _values: object
}

export type ChangeMutation = { type: 'change' }
export type ReferenceChangeMutation = { type: 'referenceChange' }
export type InsertMutation = { type: 'insert'; at: number }
export type MoveMutation = { type: 'move'; from: number; to: number }
export type RemoveMutation = { type: 'remove'; at: number }
export type ResetMutation = { type: 'reset' }
export type GlobalMutation = { type: 'global' }

type MutationType =
  | ChangeMutation
  | ReferenceChangeMutation
  | InsertMutation
  | MoveMutation
  | RemoveMutation
  | ResetMutation
  | GlobalMutation

export type OnChangeEvent = {
  type: 'forms:fields:onChange' | 'forms:reset'
  value: unknown
  previousValue: unknown
  mutationType: MutationType
  formId: string
  field: {
    data: {
      tinaField: {
        name: string
        type: 'string' | 'reference' | 'object'
        list?: boolean
        parentTypename: string
      }
    }
    name: string
  }
}

export type ChangeSet = {
  path: string
  // event: OnChangeEvent
  value: unknown
  formId: string
  fieldDefinition: {
    name: string
    type: 'string' | 'reference' | 'object'
    list?: boolean
  }
  mutationType: MutationType
  name: string
  displaceIndex?: boolean // FIXME: this should be the index, not a boolean
  formNode: FormNode
}

export type BlueprintPath = {
  name: string
  alias: string
  parentTypename?: string
  list?: boolean
  isNode?: boolean
}

export type DocumentBlueprint = {
  /** The stringified representation of a path relative to root or it's parent document */
  id: string
  /** The path to a field node */
  path: BlueprintPath[]
  /** The GraphQL SelectionNode, useful for re-fetching the given node */
  selection: G.SelectionNode
  fields: FieldBlueprint[]
  /** For now, only top-level, non-list nodes will be shown in the sidebar */
  showInSidebar: boolean
  /** these 2 are not traditional GraphQL fields but need be kept in-sync regardless */
  hasDataJSONField: boolean
  hasValuesField: boolean
  /** this blueprint is not the result of a reference */
  isTopLevel: boolean
}
export type FieldBlueprint = {
  /** The stringified representation of a path relative to root or it's parent document */
  id: string
  documentBlueprintId: string
  /** The path to a field node */
  path: BlueprintPath[]
}
export type FormNode = {
  /** The stringified path with location values injected (eg. 'getBlockPageList.edges.0.node.data.social.1.relatedPage') */
  documentFormId: string
  documentBlueprintId: string
  /** Coordinates for the DocumentBlueprint's '[]' values */
  location: number[]
}
/** The document ID is the true ID 'content/pages/hello-world.md') */

export type State = {
  schema: G.GraphQLSchema
  query: G.DocumentNode
  queryString: string
  status: 'idle' | 'initialized' | 'formified' | 'ready' | 'done'
  count: number
  data: object
  changeSets: ChangeSet[]
  blueprints: DocumentBlueprint[]
  formNodes: FormNode[]
}
