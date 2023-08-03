import { useCallback, useEffect } from 'react'
import { Form } from '@toolkit/forms'
import { useCMS, useWatchFormValues } from '@toolkit/react-core'

import { getFlattenedFormValues } from './get-flattened-form-values'

// persist pending changes to localStorage,
// and load from localstorage on boot
export function useFormBrowserCache(form: Form<any>, editing: boolean) {
  const cms = useCMS()

  const saveToStorage = useCallback(
    (_formData) => {
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
