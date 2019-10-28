/**

Copyright 2019 Forestry.io Inc

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

import { FormOptions, Form, Field } from '@tinacms/core'
import * as React from 'react'
import { useCMS } from './use-cms'

interface WatchableFormValue {
  values: any
  label: FormOptions<any>['label']
  fields: FormOptions<any>['fields']
}

export function useCMSForm<FormShape = any>(
  options: FormOptions<any>,
  watch: Partial<WatchableFormValue> = {}
): [FormShape, Form | undefined] {
  if (process.env.NODE_ENV === 'production') {
    return [options.initialValues, undefined]
  }
  const cms = useCMS()
  const [form, setForm] = React.useState<Form | undefined>()
  const [_, setValues] = React.useState(options.initialValues)

  React.useEffect(
    function createForm() {
      if (!options.initialValues) return
      const form = cms.forms.createForm(options)
      setForm(form)
      const unsubscribe = form.subscribe(
        form => {
          setValues(form.values)
        },
        { values: true }
      )

      return () => {
        unsubscribe()
        if (form) {
          cms.forms.removeForm(form.id)
        }
      }
    },
    [options.id, !!options.initialValues]
  )

  updateFormFields(watch.fields, form)
  updateFormLabel(watch.label, form)
  updateFormValues(watch.values, form)

  return [form ? form.values : options.initialValues, form]
}

/**
 * A React Hook that update's the `Form` if `fields` are changed.
 *
 * This hook is useful when dynamically creating fields, or updating
 * them via hot module replacement.
 */
function updateFormFields(fields?: Field[], form?: Form) {
  React.useEffect(() => {
    if (!form || typeof fields === 'undefined') return
    form.updateFields(fields)
  }, [form, fields])
}

/**
 * A React Hook that update's the `Form` if the `label` is changed.
 *
 * This hook is useful when dynamically creating creating the label,
 * or updating it via hot module replacement.
 */
function updateFormLabel(label?: string, form?: Form) {
  React.useEffect(() => {
    if (!form || typeof label === 'undefined') return
    form.label = label
  }, [form, label])
}

/**
 * Updates the Form with new values.
 *
 * Only updates fields that are:
 *
 * 1. registered with the form
 * 2. not currently [active](https://final-form.org/docs/final-form/types/FieldState#active)
 *
 * This hook is useful when the form must be kept in sync with the data source.
 */
function updateFormValues(values: any = {}, form?: Form) {
  React.useEffect(() => {
    if (!form || typeof values === 'undefined') return
    form.updateValues(values)
  }, [form, values])
}
