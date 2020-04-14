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

import { Form, useCMS, useWatchFormValues } from 'tinacms'
import { useCallback, useEffect } from 'react'
import { flattenFormData } from './flatten-form-data'

// persist pending changes to localStorage,
// and load from localstorage on boot
export const useLocalStorageCache = (
  path: string,
  form: Form<any>,
  editMode: boolean
) => {
  const cms = useCMS()

  const saveToStorage = useCallback(
    _formData => {
      cms.api.storage.save(path, flattenFormData(form.finalForm))
    },
    [path]
  )

  // save to storage on change
  useWatchFormValues(form, saveToStorage)

  // load from storage on boot
  useEffect(() => {
    if (!editMode) return

    const values = cms.api.storage.load(path)
    if (values) {
      form.updateValues(values)
    }
  }, [form, editMode])
}
