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

import React from 'react'
import * as G from 'graphql'
import * as util from './util'
import { Form } from '@tinacms/toolkit'
import type { TinaCMS } from '@tinacms/toolkit'
import { formify } from './formify'
import { onSubmitArgs } from '../use-graphql-forms'
import { reducer } from './reducer'

import type {
  FormifiedDocumentNode,
  OnChangeEvent,
  FormNode,
  DocumentBlueprint,
  State,
} from './types'

export { formify }

export const useFormify = ({
  query,
  cms,
  variables,
  onSubmit,
  formify: formifyFunc,
  eventList,
}: {
  query?: string
  cms: TinaCMS
  variables: object
  onSubmit?: (args: onSubmitArgs) => void
  formify
  eventList?: OnChangeEvent[]
}): State => {
  /** These will be used to ensure the appropriate forms are removed when we unmount */
  const formIds = React.useRef<string[]>([])

  const [state, dispatch] = React.useReducer(reducer, {
    status: 'idle',
    schema: undefined,
    query: query ? G.parse(query) : null,
    queryString: query,
    data: {},
    changeSets: [],
    count: 0,
    blueprints: [],
    formNodes: [],
    documentForms: [],
  })

  /**
   * Restart the entire process when the query or variables change
   */
  React.useEffect(() => {
    if (query) {
      dispatch({ type: 'start', value: { query } })
      formIds.current.forEach((formId) => {
        const form = cms.forms.find(formId)
        if (form) {
          cms.plugins.remove(form)
        }
      })
    }
  }, [query, JSON.stringify(variables)])

  /**
   * Setup the data, using the user-supplied query, this is probably redundant
   * since the `data` is a required parameter of `useGraphQLForms`, so we should be able
   * to remove this once we match the `useGraphQLForms` API
   */
  React.useEffect(() => {
    if (state.status === 'initialized') {
      cms.api.tina.request(query, { variables }).then((res) => {
        // FIXME: remove this from GraphQL
        // 'paths' was previously used to keep track of which fields were
        // references, but this is no longer necessary.
        delete res.paths
        dispatch({ type: 'setData', value: res })
      })
    }
  }, [state.status])

  /**
   * Formify the query, this takes a query like
   * ```graphql
   * {
   *   getPostDocument(relativePath: $relativePath) {
   *     data {
   *       title
   *     }
   *   }
   * }
   * ```
   * And turns it into
   * ```graphql
   * {
   *   getPostDocument(relativePath: $relativePath) {
   *     data {
   *       title
   *     }
   *     _internalSys {
   *       relativePath
   *       path
   *     }
   *     form
   *     values
   *   }
   * }
   * ```
   * So we can generate the appropriate form and data
   */
  React.useEffect(() => {
    const run = async () => {
      const schema = await cms.api.tina.getSchema()
      const result = await formify({
        schema,
        query,
        getOptimizedQuery: cms.api.tina.getOptimizedQuery,
      })
      dispatch({
        type: 'addDocumentBlueprints',
        value: result,
      })
    }
    if (state.status === 'initialized') {
      run()
    }
  }, [state.status])

  /**
   * Once the query has been formified, add formNodes to state
   * which represent the combination of a document blueprint and form
   *
   * For the given _formified_ query and result, we have a few form nodes:
   *
   * Query:
   * {
   *   getPostDocument {
   *     data {
   *       title
   *       author {
   *         ...on AuthorDocument {
   *           data {
   *             name
   *           }
   *         }
   *       }
   *     }
   *   }
   * }
   *
   * Result
   * {
   *   "getPostDocument": {
   *     "id": "content/posts/post1.mdx"
   *     "data": {
   *       "author": {
   *         "id": "content/authors/author1.mdx"
   *         "data": {
   *           "name": "Author One"
   *         }
   *       }
   *     }
   *   }
   * }
   *
   * We'd have 2 formNodes:
   * # getPostDocument with the document "content/posts/post1.mdx"
   * # getPostDocument.data.author with the document "content/authors/author1.mdx"
   *
   */
  React.useEffect(() => {
    const run = async () => {
      const result = await cms.api.tina.request(G.print(state.query), {
        variables,
      })

      state.blueprints.map((blueprint) => {
        const responseAtBlueprint =
          util.getValueForBlueprint<FormifiedDocumentNode>(
            result,
            util.getBlueprintAliasPath(blueprint)
          )
        const location = []
        const findFormNodes = (
          res: typeof responseAtBlueprint,
          location: number[]
        ): void => {
          if (Array.isArray(res)) {
            res.forEach((item, index) => {
              if (Array.isArray(item)) {
                findFormNodes(item, [...location, index])
              } else {
                if (item) {
                  const form = util.buildForm(
                    item,
                    cms,
                    formifyFunc,
                    blueprint.showInSidebar,
                    onSubmit
                  )
                  const formNode = buildFormNode(blueprint, form, [
                    ...location,
                    index,
                  ])
                  dispatch({
                    type: 'addOrReplaceDocumentFormNode',
                    value: {
                      formNode,
                      documentForm: form,
                    },
                  })
                }
              }
            })
          } else {
            if (res) {
              const form = util.buildForm(
                res,
                cms,
                formifyFunc,
                blueprint.showInSidebar,
                onSubmit
              )
              const formNode = buildFormNode(blueprint, form, location)
              dispatch({
                type: 'addOrReplaceDocumentFormNode',
                value: {
                  formNode,
                  documentForm: form,
                },
              })
            }
          }
        }
        findFormNodes(responseAtBlueprint, location)
      })
      dispatch({ type: 'ready' })
    }
    if (state.status === 'formified') {
      run()
    }
  }, [state.status])

  /**
   * Register the forms and subscribe to field-level changes
   */
  React.useEffect(() => {
    if (state.status === 'ready') {
      cms.events.subscribe(`forms:reset`, (event: OnChangeEvent) => {
        if (eventList) {
          eventList.push(util.printEvent(event))
        }
        dispatch({ type: 'formOnReset', value: { event } })
      })
      cms.events.subscribe(
        `forms:fields:onChange`,
        async (event: OnChangeEvent) => {
          if (eventList) {
            eventList.push(util.printEvent(event))
          }
          if (event.field.data.tinaField.type === 'reference') {
            let form: Form
            if (event.value && typeof event.value === 'string') {
              const existingForm = cms.forms.find(event.value)
              if (existingForm) {
                form = existingForm
              } else {
                const formInfo = await cms.api.tina.request(
                  `#graphql
                    query Node($id: String!) {
                      node(id: $id) {
                        ...on Document {
                          _values
                          _internalSys: _sys {
                            path
                            relativePath
                            collection {
                              name
                            }
                          }
                        }
                      }
                    }
                    `,
                  { variables: { id: event.value } }
                )
                form = util.buildForm(
                  formInfo.node,
                  cms,
                  formifyFunc,
                  false,
                  onSubmit
                )
              }
            }
            dispatch({
              type: 'onFieldChange',
              value: {
                event: {
                  ...event,
                  mutationType: { type: 'referenceChange' },
                },
                form,
              },
            })
          } else {
            dispatch({ type: 'onFieldChange', value: { event } })
          }
        }
      )
      dispatch({ type: 'done' })
    }
  }, [state.status])

  /**
   * Process changesets. By the time we receive a new changeset,
   * we know exactly where the new field's value should go and what
   * that value is. It could be assumed that when we have this information
   * we should just go ahead and update the state with each new value,
   * but because a new value might contain nested values, which themselves
   * need to be resolved, we can instead add this additional layer of
   * indirection so we're able to process each changeset with async
   * logic, and only resolve the value to State once every subfield
   * has settled. This allows us to support block-like items which may
   * have references in them which need to be resolved, for example.
   */
  React.useEffect(() => {
    state.changeSets.forEach((changeSet) => {
      if (changeSet.mutationType.type === 'reset') {
        const form = cms.forms.find(changeSet.formId)
        resolveSubFields({
          formNode: changeSet.formNode,
          form: form,
          loc: [],
        }).then((res) => {
          dispatch({
            type: 'setIn',
            value: {
              value: res,
              path: changeSet.path,
            },
          })
        })
        return
      } else if (changeSet.mutationType.type === 'insert') {
        if (changeSet.fieldDefinition.type === 'object') {
          const fieldName = changeSet.fieldDefinition.list
            ? `${changeSet.name}.[]`
            : changeSet.name

          const { fields, __typename } = util.getSubFields(changeSet)

          resolveSubFields({
            formNode: changeSet.formNode,
            prefix: util.replaceRealNum(fieldName),
            loc: [...util.stripIndices(changeSet.path), 0],
            form: {
              fields,
              /**
               * Insert logic only deals with the first item
               */
              values: changeSet.value[0],
            },
          }).then((res) => {
            const extra = {}
            if (__typename) {
              extra['__typename'] = __typename
            }
            dispatch({
              type: 'setIn',
              value: {
                displaceIndex: true,
                ...changeSet,
                value: {
                  ...res,
                  ...extra,
                },
              },
            })
          })
        } else {
          dispatch({
            type: 'setIn',
            value: {
              displaceIndex: true,
              ...changeSet,
              value: changeSet.value[0],
            },
          })
        }
      } else {
        if (changeSet.mutationType.type === 'referenceChange') {
          const { formNode } = changeSet
          const blueprint = util.getFormNodeBlueprint(formNode, state)
          if (!changeSet.value) {
            dispatch({
              type: 'setIn',
              value: {
                ...changeSet,
                value: null,
              },
            })
          } else {
            cms.api.tina
              .request(
                `
              query Node($id: String!) {
                node(id: $id) {
                  ${G.print(blueprint.selection)}
                }
              }
            `,
                { variables: { id: changeSet.value } }
              )
              .then(async (res) => {
                const form = state.documentForms.find(
                  (documentForm) => documentForm.id === formNode.documentFormId
                )
                const data = await resolveSubFields({
                  formNode,
                  form,
                  loc: formNode.location,
                })
                dispatch({
                  type: 'setIn',
                  value: {
                    ...changeSet,
                    value: {
                      ...res.node,
                      ...data,
                    },
                  },
                })
              })
              .catch((e) => {
                cms.alerts.error(`Unexpected error fetching reference.`)
                console.log(e)
              })
          }
        } else {
          dispatch({ type: 'setIn', value: changeSet })
        }
      }
    })
  }, [JSON.stringify(state.changeSets)])

  /**
   * NOTE: we're mimicking `componentWillUnmount` by keeping track of
   * form ids that have been registered in a ref, in the useEffect hook
   * below we use an empty depency array so it only runs with the entire
   * hook unmounts. This isn't ideal, but since cms.forms state isn't
   * React state it's not as trivial as it may seem
   */
  React.useEffect(() => {
    formIds.current = state.documentForms.map((df) => df.id)
  }, [state.documentForms.length])
  React.useEffect(() => {
    return () => {
      formIds.current.forEach((formId) => {
        const form = cms.forms.find(formId)
        if (form) {
          cms.plugins.remove(form)
        }
      })
    }
  }, [])

  /**
   * Takes a form node and populates all locations in the graph with the appropriate
   * values. This resolves each field, including asynchronous fields before updating
   * the `state.data` with the value.
   */
  const resolveSubFields = React.useCallback(
    async (args: {
      formNode: FormNode
      prefix?: string
      loc: number[]
      form: Pick<Form, 'values' | 'fields'>
    }) => {
      const { form, formNode, prefix, loc } = args
      const data = {}
      await util.sequential(form.fields, async (field) => {
        const value = form.values[field.name]

        const blueprint = util.getFormNodeBlueprint(formNode, state)
        const { matchName, fieldName } = util.getMatchName({
          field,
          prefix,
          blueprint,
        })
        const fieldBlueprints = blueprint.fields
          .filter((fieldBlueprint) => {
            return matchName === util.getBlueprintNamePath(fieldBlueprint)
          })
          .filter((fbp) =>
            util.filterFieldBlueprintsByParentTypename(
              fbp,
              field.parentTypename
            )
          )
        switch (field.type) {
          case 'object':
            if (field.templates) {
              if (field.list) {
                await util.sequential(
                  fieldBlueprints,
                  async (fieldBlueprint) => {
                    const keyName = util.getFieldNameOrAlias(fieldBlueprint)
                    if (!value) {
                      data[keyName] = null
                      return true
                    }
                    if (!Array.isArray(value)) {
                      throw new Error(
                        `Expected value for object list field to be an array`
                      )
                    }
                    data[keyName] = await util.sequential(
                      value,
                      async (item, index) => {
                        const template = field.templates[item._template]
                        return {
                          ...(await resolveSubFields({
                            formNode,
                            form: { fields: template.fields, values: item },
                            prefix: prefix
                              ? [prefix, fieldName].join('.')
                              : fieldName,
                            loc: [...loc, index],
                          })),
                          __typename: field.typeMap[item._template],
                        }
                      }
                    )
                  }
                )
              } else {
                throw new Error('blocks without list true is not yet supported')
              }
            } else {
              if (field.list) {
                await util.sequential(
                  fieldBlueprints,
                  async (fieldBlueprint) => {
                    const keyName = util.getFieldNameOrAlias(fieldBlueprint)
                    if (!value) {
                      data[keyName] = null
                      return true
                    }
                    if (!Array.isArray(value)) {
                      throw new Error(
                        `Expected value for object list field to be an array`
                      )
                    }
                    data[keyName] = await util.sequential(
                      value,
                      async (item, index) => {
                        return resolveSubFields({
                          formNode,
                          form: { fields: field.fields, values: item },
                          prefix: [prefix, fieldName].join('.'),
                          loc: [...loc, index],
                        })
                      }
                    )
                    return true
                  }
                )
              } else {
                await util.sequential(
                  fieldBlueprints,
                  async (fieldBlueprint) => {
                    const keyName = util.getFieldNameOrAlias(fieldBlueprint)
                    if (!value) {
                      data[keyName] = null
                      return true
                    }
                    data[keyName] = await resolveSubFields({
                      formNode,
                      form: { fields: field.fields, values: value },
                      prefix: [prefix, fieldName].join('.'),
                      loc,
                    })
                    return true
                  }
                )
              }
            }
            break
          case 'reference':
            let form: Form
            if (typeof value === 'string') {
              const existingForm = cms.forms.find(value)
              if (existingForm) {
                form = existingForm
              } else {
                const formInfo = await cms.api.tina.request(
                  `#graphql
                      query Node($id: String!) {
                        node(id: $id) {
                          ...on Document {
                            _values
                            _internalSys: _sys {
                              path
                              relativePath
                              collection {
                                name
                              }
                            }
                          }
                        }
                      }
                    `,
                  { variables: { id: value } }
                )
                form = util.buildForm(
                  formInfo.node,
                  cms,
                  formifyFunc,
                  false,
                  onSubmit
                )
              }
            }

            await util.sequential(fieldBlueprints, async (fieldBlueprint) => {
              const keyName = util.getFieldNameOrAlias(fieldBlueprint)
              if (!value) {
                data[keyName] = null
                return true
              }

              const documentBlueprint = state.blueprints.find(
                (dp) => util.getBlueprintNamePath(dp) === matchName
              )
              const location = [...formNode.location]
              if (loc) {
                loc.forEach((item) => location.push(item))
              }
              const subDocumentFormNode = buildFormNode(
                documentBlueprint,
                form,
                location
              )

              dispatch({
                type: 'addOrReplaceDocumentFormNode',
                value: {
                  formNode: subDocumentFormNode,
                  documentForm: form,
                },
              })

              const res = await cms.api.tina.request(
                `
                    query Node($id: String!) {
                      node(id: $id) {
                        ${G.print(documentBlueprint.selection)}
                      }
                    }
                  `,
                { variables: { id: value } }
              )
              data[keyName] = {
                ...res.node,
                ...(await resolveSubFields({
                  formNode: subDocumentFormNode,
                  form,
                  loc: location,
                })),
              }
            })

            break
          default:
            fieldBlueprints.forEach((fieldBlueprint) => {
              const keyName = util.getFieldNameOrAlias(fieldBlueprint)
              if (!value) {
                data[keyName] = null
              } else {
                data[keyName] = value
              }
            })
            break
        }
        return true
      })
      return data
    },
    [cms, JSON.stringify(state), dispatch]
  )
  return {
    ...state,
    queryString: G.print(state.query),
  }
}

const buildFormNode = (
  documentBlueprint: DocumentBlueprint,
  form: Form,
  location: number[]
): FormNode => {
  return {
    documentBlueprintId: documentBlueprint.id,
    documentFormId: form.id,
    location,
  }
}
