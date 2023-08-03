import { FormOptions, Form } from '@toolkit/forms'
import { GlobalFormPlugin } from '@toolkit/plugin-screens'
import { useMemo } from 'react'
import { useForm, WatchableFormValue, usePlugins } from '@toolkit/react-core'
export { useLocalForm, useForm } from '@toolkit/react-core'
export type { WatchableFormValue } from '@toolkit/react-core'

/**
 * @deprecated See https://github.com/tinacms/rfcs/blob/master/0006-form-hook-conventions.md
 */
export function useGlobalForm<FormShape = any>(
  options: FormOptions<any>,
  watch: Partial<WatchableFormValue> = {}
): [FormShape, Form | undefined] {
  const [values, form] = useForm(options, watch)

  const GlobalForm = useMemo(() => {
    if (!form) return

    return new GlobalFormPlugin(form)
  }, [form])

  usePlugins(GlobalForm)

  return [values, form]
}

/**
 * Creates and registers ScreenPlugin that renders the given Form.
 */
export function useFormScreenPlugin(
  form: Form,
  icon?: any,
  layout?: 'fullscreen' | 'popup'
) {
  const GlobalForm = useMemo(() => {
    if (!form) return

    return new GlobalFormPlugin(form, icon, layout)
  }, [form, icon, layout])

  usePlugins(GlobalForm)
}
