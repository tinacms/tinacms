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
      findInactiveFormFields(form).forEach(path => {
        form.finalForm.change(path, get(initialValues, path))
      })
    })
  }, [initialValues])
}

function findInactiveFormFields(form: Form) {
  let pathsToUpdate: string[] = []
  Object.entries(form.fieldSubscriptions).forEach(([path, field]) => {
    pathsToUpdate = pathsToUpdate.concat(findInactiveFieldsInPath(form, path))
  })
  return pathsToUpdate
}

/**
 * Recursively looks up all fields associated with a path.
 *
 * Simple string
 * ```
 * 'name' => ['name']
 * ```
 *
 * With a list of two authors:
 * ```
 * 'authors.INDEX.name' => [
 *  'authors.0.name',
 *  'authors.1.name',
 * ]
 * ```
 *
 * With a list of one author with two books:
 * ```
 * 'authors.INDEX.books.INDEX.title' => [
 *  'authors.0.books.0.title',
 *  'authors.0.books.1.title',
 * ]
 * ```
 */
export function findInactiveFieldsInPath(form: Form, path: string) {
  let pathsToUpdate: string[] = []

  if (/INDEX/.test(path)) {
    let listPath = path.split('.INDEX.')[0]
    let listState = get(form.finalForm.getState().values, listPath, [])
    if (listState) {
      for (let i = 0; i < listState.length; i++) {
        let indexPath = path.replace('INDEX', `${i}`)
        let subpaths = findInactiveFieldsInPath(form, indexPath)
        pathsToUpdate = [...pathsToUpdate, ...subpaths]
      }
    }
  } else {
    let state = form.finalForm.getFieldState(path)
    if (!state || !state.active) {
      pathsToUpdate.push(path)
    }
  }
  return pathsToUpdate
}
