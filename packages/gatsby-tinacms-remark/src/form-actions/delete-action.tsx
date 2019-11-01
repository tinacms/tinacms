import * as React from 'react'
import { Form } from '@tinacms/core'
import { useCMS } from 'react-tinacms'
import { ActionButton } from 'tinacms'

export function DeleteAction({ form }: { form: Form }) {
  const cms = useCMS()
  return (
    <ActionButton
      onClick={async () => {
        if (
          !confirm(
            `Are you sure you want to delete ${form.values.fileRelativePath}?`
          )
        ) {
          return
        }
        await cms.api.git.onDelete!({
          relPath: form.values.fileRelativePath,
        })

        window.history.back()
      }}
    >
      Delete
    </ActionButton>
  )
}
