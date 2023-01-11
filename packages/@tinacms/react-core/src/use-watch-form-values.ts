/**

Copyright 2021 Forestry.io Holdings, Inc.

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

import { Form } from '@einsteinindustries/tinacms-forms'
import { FormSubscriber } from 'final-form'
import { useEffect } from 'react'

/**
 * Subscribes to value updates from the form with the given callback.
 */
export function useWatchFormValues(
  form: Form | undefined,
  cb: FormSubscriber<any>
) {
  useEffect(() => {
    if (!form) return

    // `form.subscribe` sends the current state on-subscription.
    // We want to ignore that first call.
    let firstUpdate = true

    return form.subscribe(
      formState => {
        if (firstUpdate) {
          firstUpdate = false
        } else {
          cb(formState)
        }
      },
      { values: true }
    )
  }, [cb, form])
}
