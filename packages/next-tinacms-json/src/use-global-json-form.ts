import { JsonFile, useJsonForm } from './use-json-form'
import { useMemo } from 'react'
import { GlobalFormPlugin, usePlugins } from 'tinacms'

/**
 * Registers a Global Form with TinaCMS for editing a Json File.
 */
export function useGlobalJsonForm(jsonFile: JsonFile) {
  const [values, form] = useJsonForm(jsonFile)
  const globalFormPlugin = useMemo(() => {
    if (form) {
      return new GlobalFormPlugin(form, null)
    }
  }, [form])

  usePlugins(globalFormPlugin)

  return [values, form]
}
