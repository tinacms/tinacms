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

import { useCallback, useEffect } from 'react'
import { Form } from '@tinacms/forms'
import { useCMS, useWatchFormValues } from '@tinacms/react-core'

import { getFlattenedFormValues } from './get-flattened-form-values'

// persist pending changes to localStorage,
// and load from localstorage on boot
export function useFormBrowserCache(form: Form<any>, editing: boolean) {
  const cms = useCMS()

  const saveToStorage = useCallback(
    _formData => {
      cms.api.storage.save(form.id, getFlattenedFormValues(form))
    },
    [form.id]
  )

  // save to storage on change
  useWatchFormValues(form, saveToStorage)

  // load from storage on boot
  useEffect(() => {
    if (!editing) return

    const values = cms.api.storage.load(form.id)
    if (values) {
      form.updateValues(values)
    }
  }, [form, editing])
}
