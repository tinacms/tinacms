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

import { Form } from 'tinacms'
import { useEffect } from 'react'
import createDecorator from 'final-form-submit-listener'
import { useOpenAuthoring } from '../open-authoring/OpenAuthoringProvider'

// Show success/fail feedback on form submission
const useOpenAuthoringErrorListener = (form: Form) => {
  const openAuthoring = useOpenAuthoring()

  useEffect(() => {
    const submitListener = createDecorator({
      afterSubmitFailed: async (failedForm: any) => {
        openAuthoring.setError(failedForm.getState().submitError)
      },
    })

    const undecorateSaveListener = submitListener(form.finalForm)

    return undecorateSaveListener
  }, [form])
}

export default useOpenAuthoringErrorListener
