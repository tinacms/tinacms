import { FormOptions, Form } from '@tinacms/core'
import * as React from 'react'
import { useCMS } from './use-cms'
let get = require('lodash.get')

export function useCMSForm(options: FormOptions<any>) {
  let cms = useCMS()
  let [form, setForm] = React.useState<Form | undefined>()
  let [_, setValues] = React.useState(options.initialValues)

  React.useEffect(
    function createForm() {
      let form = cms.forms.createForm(options)
      setForm(form)
      form.subscribe(
        form => {
          setValues(form.values)
        },
        { values: true }
      )

      return () => {
        form && cms.forms.removeForm(form.id)
      }
    },
    [options.id]
  )

  syncFormWithInitialValues(form, options.initialValues)

  return [form ? form.values : options.initialValues, form]
}

/**
 * Updates the Form with new values from the MarkdownRemark node.
 *
 * Only updates fields that are:
 *
 * 1. registered with the form
 * 2. not currently active
 *
 * TODO: Move into `react-tinacms`
 */
function syncFormWithInitialValues(form?: Form, initialValues?: any) {
  React.useEffect(() => {
    if (!form) return
    form.finalForm.batch(() => {
      findInactiveFields(form).forEach(path => {
        form.finalForm.change(path, get(initialValues, path))
      })
    })
  }, [initialValues])
}

function findInactiveFields(form: Form) {
  let pathsToUpdate: string[] = []
  Object.entries(form.fieldSubscriptions).forEach(([path]) => {
    let state = form.finalForm.getFieldState(path)
    if (!state) return

    if (/INDEX/.test(path)) {
      let listPath = path.split('.INDEX.')[0]
      let listState = form.finalForm.getFieldState(listPath)
      if (!listState) return

      for (let i = 0; i < listState.value.length; i++) {
        let indexPath = path.replace('INDEX', `${i}`)
        let indexState = form.finalForm.getFieldState(indexPath)
        if (indexState && !indexState!.active) {
          pathsToUpdate.push(indexPath)
        }
      }
    } else if (!state.active) {
      pathsToUpdate.push(path)
    }
  })
  return pathsToUpdate
}
