import { Form } from '@toolkit/forms'
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
      (formState) => {
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
