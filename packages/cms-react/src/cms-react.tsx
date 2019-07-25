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
      form.subscribe(
        form => {
          setValues(form.values)
        },
        { values: true }
      )

      return () => {
        form && cms.forms.removeForm(form.name)
      }
    },
    [options.name]
  )

  return [form, form ? form.values : options.initialValues]
}

/**
 * TODO: Is there a better approach?
 * TODO: move to cms-react
 */
export function useSubscribable(subscribable: Subscribeable, cb?: Function) {
  let [_, s] = React.useState(0)
  React.useEffect(() => {
    return subscribable.subscribe(() => {
      s(x => x + 1)
      if (cb) cb()
    })
  })
}
