import * as React from 'react'
import { CMS, Form, Subscribeable } from '@forestryio/cms'

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

  React.useEffect(function createForm() {
    let form = cms.forms.createForm(options)
    let reloadValues = () => setValues(form.values)
    form.subscribe(reloadValues)
    setForm(form)
    return () => form.unsubscribe(reloadValues)
  }, [])

  return [form, form ? form.values : options.initialValues]
}

/**
 * TODO: Is there a better approach?
 * TODO: move to cms-react
 */
export function useSubscribable(subscribable: Subscribeable) {
  let [_, s] = React.useState(0)
  React.useEffect(() => {
    let forceUpdate = () => s(x => x + 1)
    subscribable.subscribe(forceUpdate)
    return () => subscribable.unsubscribe(forceUpdate)
  })
}
