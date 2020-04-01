import { Form } from 'tinacms'
import { useEffect } from 'react'
import createDecorator from 'final-form-submit-listener'
import { useOpenAuthoring } from '../open-authoring/OpenAuthoringProvider'

// Show success/fail feedback on form submission
const useOpenAuthoringErrorListener = (form: Form) => {
  const openAuthoring = useOpenAuthoring()

  useEffect(() => {
    const submitListener = createDecorator({
      afterSubmitFailed: async failedForm => {
        openAuthoring.setError(failedForm.getState().submitError)
      },
    })

    const undecorateSaveListener = submitListener(form.finalForm)

    return undecorateSaveListener
  }, [form])
}

export default useOpenAuthoringErrorListener
