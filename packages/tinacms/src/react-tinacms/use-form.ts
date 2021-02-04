import { FormOptions, Form } from '@tinacms/forms'
import { GlobalFormPlugin } from '../plugins/screens'
import { useMemo } from 'react'
import { useForm, WatchableFormValue, usePlugins } from '@tinacms/react-core'

/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

export { useLocalForm, useForm, WatchableFormValue } from '@tinacms/react-core'

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
