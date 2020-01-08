import { useJsonForm, JsonFile } from './use-json-form'
import { usePlugins } from 'tinacms'

/**
 * Registers a Local Form with TinaCMS for editing a Json File.
 */
export function useLocalJsonForm<T = any>(jsonFile: JsonFile<T>) {
  const [values, form] = useJsonForm(jsonFile)

  usePlugins(form)

  return [values, form]
}
