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

import finalFormArrays from 'final-form-arrays'
import { getIn, setIn } from 'final-form'
import type { NodeFormEvent, NodeFormContext } from './form-service'
import type { Form } from '@tinacms/toolkit'

export const fixMutators = (args: {
  context: NodeFormContext
  callback: (args: NodeFormEvent) => void
  form: Form<
    {
      [x: string]: any
    },
    any
  >
}) => {
  const { form, context, callback } = args

  /**
   *
   * The following changes to final-form mutators are not intended to
   * be a long-term solution. The goal of these changes is to enable
   * the ability to "subscribe" to field-level changes for array mutations.
   *
   * An example of this is that we don't get any sort of event from Tina
   * when a new block or list item is added, rearranged, or removed. This
   * makes it impossible for us to keep the `data` of our GraphQL response
   * in-sync with form state.
   *
   * A long-term solution for this should be discussed in this ticket
   * https://github.com/tinacms/tinacms/issues/1669
   *
   */
  const changeValue = (state, name, mutate) => {
    const before = getIn(state.formState.values, name)
    const after = mutate(before)
    state.formState.values = setIn(state.formState.values, name, after) || {}
  }

  const {
    // @ts-ignore
    move: moveCopy,
    // @ts-ignore
    remove: removeCopy,
    // @ts-ignore
    insert: insertCopy,
  } = {
    ...form.finalForm.mutators,
  }
  form.finalForm.mutators.move = (name, from, to) => {
    const dataValue = getIn(context.node.data, name)
    let state = {
      formState: { values: { fakeValue: dataValue } },
    }
    try {
      // @ts-ignore state is expecting the full final-form state, but we don't need it
      finalFormArrays.move(['fakeValue', from, to], state, { changeValue })
      // FIXME: this throws an error, probably because of "state" but the mutation works :shrug:
    } catch (e) {
      callback({
        type: 'ON_FIELD_CHANGE',
        values: {
          path: [context.queryFieldName, 'data', ...name.split('.')],
          value: state.formState.values.fakeValue,
        },
      })
    }

    // Return the copy like nothing ever happened
    return moveCopy(name, from, to)
  }

  form.finalForm.mutators.remove = (name, index) => {
    const dataValue = getIn(context.node.data, name)
    let state = {
      formState: { values: { fakeValue: dataValue } },
    }
    try {
      // @ts-ignore state is expecting the full final-form state, but we don't need it
      finalFormArrays.remove(['fakeValue', index], state, { changeValue })
      // FIXME: this throws an error, probably because of "state" but the mutation works :shrug:
    } catch (e) {
      callback({
        type: 'ON_FIELD_CHANGE',
        values: {
          path: [context.queryFieldName, 'data', ...name.split('.')],
          value: state.formState.values.fakeValue,
        },
      })
    }

    // Return the copy like nothing ever happened
    return removeCopy(name, index)
  }

  form.finalForm.mutators.insert = (name, index, item) => {
    const dataValue = getIn(context.node.data, name)
    let state = {
      formState: { values: { fakeValue: dataValue } },
    }
    try {
      let newItem = item
      // FIXME: this is a pretty rough translation, not sure if "_Data" would be present in all cases
      // This should be abstracted in to graphql-helpers so we can commonize these transforms
      if (item._template) {
        newItem = {
          __typename:
            item._template.charAt(0).toUpperCase() +
            item._template.slice(1) +
            '_Data',
        }
      } else {
        // if item is -> {}, the real insertCopy doesn't set up the event listeners properly
        // so inputs within the added field won't work for some reason
        if (
          item &&
          Object.keys(item).length === 0 &&
          item.constructor === Object
        ) {
          item = null
        }
      }
      finalFormArrays.insert(
        ['fakeValue', index, newItem],
        // @ts-ignore state is expecting the full final-form state, but we don't need it
        state,
        {
          changeValue,
        }
      )
      // FIXME: this throws an error, probably because of "state" but the mutation works :shrug:
    } catch (e) {
      callback({
        type: 'ON_FIELD_CHANGE',
        values: {
          path: [context.queryFieldName, 'data', ...name.split('.')],
          value: state.formState.values.fakeValue,
        },
      })
    }

    // Return the copy like nothing ever happened
    return insertCopy(name, index, item)
  }
}
