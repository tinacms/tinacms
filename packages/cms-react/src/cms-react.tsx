import * as React from 'react'
import { CMS, Form, Subscribeable, FormOptions } from '@forestryio/cms'

export const CMSContext = React.createContext<CMS | null>(null)

export function useCMS(): CMS {
  let cms = React.useContext(CMSContext)

  if (!cms) {
    throw new Error('No CMS provided')
  }

  return cms
}

export function useCMSForm(options: FormOptions<any>) {
  let cms = useCMS()
  let [form, setForm] = React.useState<Form | null>(null)
  let [_, setValues] = React.useState(options.initialValues)

  React.useEffect(
    function createForm() {
      let form = cms.forms.createForm(options)
      setForm(form)
      return form.subscribe(
        form => {
          setValues(form.values)
        },
        { values: true }
      )
    },
    [options.name]
  )

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
