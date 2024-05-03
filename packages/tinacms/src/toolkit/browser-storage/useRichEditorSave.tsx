import { useCallback, useEffect, useState } from 'react'
import { useCMS } from '@toolkit/react-core'
import { Form } from '@toolkit/forms'

export function useRichEditorSave(
  formId: string,
  name: string,
  editing: boolean,
  inputValue: any,
  form: Form<any>
) {
  const [renderInitalValue, setRenderInitialValue] = useState(null)
  const cms = useCMS()

  const saveToStorage = useCallback(
    (value) => {
      console.log(`Saving ${name} to storage`)

      cms.api.tina.storage.save(formId, { [name]: value })
    },
    [formId, name]
  )

  // Save if dirty and editing is enabled
  useEffect(() => {
    if (editing && inputValue) {
      console.log(`useRichEditorSave: ${name} is dirty`)
      console.log(`Form ID: `, formId)
      console.log(`Value is: `, inputValue)

      saveToStorage(inputValue)
    }
  }, [editing, saveToStorage, inputValue])

  // Load on mount when editing
  useEffect(() => {
    if (editing) {
      const savedValue = cms.api.tina.storage.load(formId)
      if (savedValue) {
        // Update the rich editor's value (implementation depends on your RichEditor component)
        console.log(form)
        console.log('Saved Value: ', savedValue)
        setRenderInitialValue(savedValue)
        form.updateValues(savedValue)
      }
    }
  }, [formId, name, editing])

  return { renderInitalValue }
}
