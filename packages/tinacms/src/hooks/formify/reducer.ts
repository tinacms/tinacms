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

import * as util from './util'
import { setIn, getIn } from 'final-form'
import * as G from 'graphql'

import { FormNode, ChangeSet, State, Action, OnChangeEvent } from './types'

const defaultState: State = {
  status: 'idle',
  schema: undefined,
  query: null,
  queryString: null,
  data: {},
  changeSets: [],
  count: 0,
  blueprints: [],
  formNodes: [],
  documentForms: [],
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'start':
      return {
        ...state,
        ...defaultState,
        query: action.value.query ? G.parse(action.value.query) : null,
        queryString: action.value.query,
        status: 'initialized',
      }
    /**
     * Add document blueprints, used on the initial setup only
     *
     * @changes blueprints, query
     */
    case 'addDocumentBlueprints':
      return {
        ...state,
        status: 'formified',
        blueprints: action.value.blueprints,
        query: action.value.formifiedQuery,
      }
    /**
     * Add document form node, used on the initial pass through the data to set up
     * and then any time we get a reference field change
     *
     * @changes formNodes, documentForms
     */
    case 'addOrReplaceDocumentFormNode': {
      const existingDocumentForms = state.documentForms.filter(
        (documentForm) => {
          return documentForm.id !== action.value?.documentForm?.id
        }
      )

      const existingDocumentFormNodes = state.formNodes.filter((formNode) => {
        return (
          util.formNodeId(formNode) !== util.formNodeId(action.value.formNode)
        )
      })

      const newDocumentForms = []
      if (action.value?.documentForm) {
        newDocumentForms.push(action.value?.documentForm)
      }

      return {
        ...state,
        formNodes: [...existingDocumentFormNodes, action.value.formNode],
        documentForms: [...existingDocumentForms, ...newDocumentForms],
      }
    }

    case 'onFieldChange': {
      const event = action.value.event
      const changeSets: ChangeSet[] = []
      const formNodesToReplace: FormNode[] = []
      const formNodesToRemove: FormNode[] = []
      const newFormNodes: FormNode[] = []
      const form = state.documentForms.find(
        (documentForm) => documentForm.id === event.formId
      )
      util.getFormNodesFromEvent(state, event).forEach((formNode) => {
        const blueprint = util.getFormNodeBlueprint(formNode, state)

        /**
         *
         * If `values` or `dataJSON` is queried, keep them in-sync
         * with the form's values
         *
         */
        if (blueprint.hasValuesField) {
          changeSets.push({
            path: [util.formNodePath(formNode), 'values'].join('.'),
            ...buildChangeSet(event, formNode),
            value: form.values,
            mutationType: {
              type: 'global',
            },
          })
        }
        if (blueprint.hasDataJSONField) {
          changeSets.push({
            path: [util.formNodePath(formNode), 'dataJSON'].join('.'),
            ...buildChangeSet(event, formNode),
            value: form.values,
            mutationType: {
              type: 'global',
            },
          })
        }
        /**
         *
         *
         */
        if (event.mutationType.type === 'change') {
          if (!action.value.form) {
            util
              .getBlueprintFieldsForEvent(blueprint, event)
              .forEach((fieldBlueprint) => {
                const { pathToChange } = util.getFormNodesForField(
                  fieldBlueprint,
                  formNode,
                  event,
                  state
                )
                changeSets.push({
                  path: pathToChange,
                  ...buildChangeSet(event, formNode),
                })
              })
          }
        } else if (event.mutationType.type === 'referenceChange') {
          util
            .getBlueprintFieldsForEvent(blueprint, event)
            .forEach((fieldBlueprint) => {
              const {
                pathToChange,
                formNodes: subFormNodes,
                eventLocation,
              } = util.getFormNodesForField(
                fieldBlueprint,
                formNode,
                event,
                state
              )

              if (
                action.value.form &&
                state.blueprints.find(
                  (blueprint) => blueprint.id === fieldBlueprint.id
                )
              ) {
                const newFormNode: FormNode = {
                  documentBlueprintId: fieldBlueprint.id,
                  documentFormId: action.value.form.id,
                  location: eventLocation,
                }
                newFormNodes.push(newFormNode)
                changeSets.push({
                  path: pathToChange,
                  ...buildChangeSet(event, newFormNode),
                })
              }
              subFormNodes.forEach((subFormNode) => {
                if (util.matchLocation(eventLocation, subFormNode)) {
                  if (!action.value.form) {
                    changeSets.push({
                      path: pathToChange,
                      ...buildChangeSet(event, subFormNode),
                      value: null,
                    })
                  }
                  formNodesToReplace.push(subFormNode)
                }
              })
            })
        } else {
          util
            .getBlueprintFieldsForEvent(blueprint, event)
            .forEach((fieldBlueprint) => {
              const { pathToChange, formNodes, existing, eventLocation } =
                util.getFormNodesForField(
                  fieldBlueprint,
                  formNode,
                  event,
                  state
                )

              if (event.mutationType.type === 'insert') {
                formNodes.forEach((subFormNode) => {
                  if (util.matchLocation(eventLocation, subFormNode)) {
                    newFormNodes.push({
                      ...subFormNode,
                      location: util.bumpLocation(subFormNode.location),
                    })
                    formNodesToReplace.push(subFormNode)
                  }
                })
                changeSets.push({
                  path: pathToChange,
                  ...buildChangeSet(event, formNode),
                })
              }
              if (event.mutationType.type === 'remove') {
                const { at } = event.mutationType
                formNodes.forEach((subFormNode) => {
                  if (util.matchLocation(eventLocation, subFormNode)) {
                    if (util.matchesAt(subFormNode.location, at)) {
                      formNodesToRemove.push(subFormNode)
                    } else {
                      newFormNodes.push({
                        ...subFormNode,
                        location: util.maybeLowerLocation(
                          subFormNode.location,
                          at
                        ),
                      })
                      formNodesToReplace.push(subFormNode)
                    }
                  }
                })

                const next = existing.filter((_, index) => index !== at)

                changeSets.push({
                  path: pathToChange,
                  ...buildChangeSet(event, formNode),
                  value: next,
                })
              }
              if (event.mutationType.type === 'move') {
                const next = []
                const { from, to } = event.mutationType
                const newOrderObject = util.getMoveMapping(existing, from, to)
                formNodes.forEach((subFormNode) => {
                  if (util.matchLocation(eventLocation, subFormNode)) {
                    newFormNodes.push({
                      ...subFormNode,
                      location: util.swapLocation(
                        subFormNode.location,
                        newOrderObject
                      ),
                    })
                    formNodesToReplace.push(subFormNode)
                  }
                })
                Object.values(newOrderObject).forEach((orderIndex, index) => {
                  next[orderIndex] = existing[index]
                })

                changeSets.push({
                  path: pathToChange,
                  ...buildChangeSet(event, formNode),
                  value: next,
                })
              }
            })
        }
      })
      const existingDocumentForms = state.documentForms.filter(
        (documentForm) => {
          return documentForm.id !== action.value.form?.id
        }
      )
      const newDocumentForms = []
      if (action.value?.form) {
        newDocumentForms.push(action.value?.form)
      }
      return {
        ...state,
        changeSets,
        formNodes: [
          ...state.formNodes
            .filter((formNode) =>
              util.formNodeNotIn(formNode, formNodesToReplace)
            )
            .filter((formNode) =>
              util.formNodeNotIn(formNode, formNodesToRemove)
            ),
          ...newFormNodes,
        ],
        documentForms: [...existingDocumentForms, ...newDocumentForms],
      }
    }

    /**
     * @changes changesets
     */
    case 'formOnReset': {
      const { event } = action.value
      const changeSets: ChangeSet[] = []
      const form = state.documentForms.find(
        (documentForm) => documentForm.id === event.formId
      )
      state.formNodes
        .filter((fn) => fn.documentFormId === form?.id)
        .forEach((formNode) => {
          const blueprint = util.getFormNodeBlueprint(formNode, state)
          if (blueprint.hasValuesField) {
            changeSets.push({
              path: [util.formNodePath(formNode), '_values'].join('.'),
              ...buildChangeSet(event, formNode),
            })
          }
          changeSets.push({
            path: [util.formNodePath(formNode)].join('.'),
            ...buildChangeSet(event, formNode),
          })
        })
      return { ...state, changeSets }
    }
    case 'ready':
      return { ...state, status: 'ready' }
    case 'done':
      return { ...state, status: 'done' }
    case 'setData':
      return { ...state, data: action.value }
    case 'setIn': {
      let newData
      if (action.value.displaceIndex) {
        const existing = getIn(state.data, action.value.path) || []
        newData = setIn(state.data, action.value.path, [
          action.value.value,
          ...existing,
        ])
      } else {
        newData = setIn(state.data, action.value.path, action.value.value)
      }
      const changeSets = state.changeSets.filter(
        (cs) => cs.path !== action.value.path
      )
      return {
        ...state,
        data: newData,
        changeSets,
      }
    }
    default:
      return state
  }
}

export const buildChangeSet = (event: OnChangeEvent, formNode: FormNode) => {
  return {
    fieldDefinition: event.field?.data?.tinaField,
    name: event.field?.name,
    formId: event.formId,
    mutationType: event.mutationType,
    value: event.value,
    formNode: formNode,
  }
}
