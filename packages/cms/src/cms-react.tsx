import * as React from 'react'
import { CMS } from './cms'
import { Form } from './cms-forms'

export const CMSContext = React.createContext<CMS | null>(null)

export function useCMS(): CMS {
  let cms = React.useContext(CMSContext)

  if (!cms) {
    throw new Error('No CMS provided')
  }

  return cms
}

export function useCMSForm(options: Form) {
  let cms = useCMS()
  let [form, setForm] = React.useState<Form | null>(null)
  let [values, setValues] = React.useState(options.initialValues)

  let reloadValues = React.useCallback(() => {
    if (form) setValues(form.values)
  }, [setValues, cms])

  React.useEffect(function createForm() {
    let form = cms.forms.createForm(options)
    form.subscribe(reloadValues)
    setForm(form)
    setValues(form.values)
    return () => form.unsubscribe(reloadValues)
  }, [])

  return [form, form ? form.values : options.initialValues]
}
