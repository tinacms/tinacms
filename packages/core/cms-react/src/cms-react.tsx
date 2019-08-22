import * as React from 'react'
import { CMS, Plugin, Form, Subscribable, FormOptions } from '@forestryio/cms'

export const ERROR_MISSING_CMS = `useCMS could not find an instance of CMS`

export const CMSContext = React.createContext<CMS | null>(null)

export function useCMS(): CMS {
  let cms = React.useContext(CMSContext)

  if (!cms) {
    throw new Error(ERROR_MISSING_CMS)
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

  return [form ? form.values : options.initialValues, form]
}

/**
 * TODO: Is there a better approach?
 * TODO: move to cms-react
 */
export function useSubscribable(subscribable: Subscribable, cb?: Function) {
  let [_, s] = React.useState(0)
  React.useEffect(() => {
    return subscribable.subscribe(() => {
      s(x => x + 1)
      if (cb) cb()
    })
  })
}

export function usePlugin(plugin: Plugin) {
  let cms = useCMS()
  React.useEffect(() => {
    cms.plugins.add(plugin)
    return () => cms.plugins.remove(plugin)
  }, [plugin])
}
