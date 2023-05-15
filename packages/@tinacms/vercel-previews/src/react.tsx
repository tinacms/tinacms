import { tinaField, useEditState } from 'tinacms/dist/react'
import { useCallback, useEffect } from 'react'

export const vercelEditInfo = <
  T extends object & {
    _content_source?: {
      queryId: string
      path: (number | string)[]
    }
  }
>(
  obj: T,
  field?: keyof Omit<T, '__typename' | '_sys'>,
  index?: number
) => {
  const fieldName = tinaField(obj, field, index)
  return JSON.stringify({ origin: 'tinacms', data: { fieldName } })
}

export const useEditOpen = (redirect: string) => {
  const { edit } = useEditState()
  const handleOpenEvent = useCallback(
    (event: CustomEventInit) => {
      if (edit) {
        parent.postMessage(
          { type: 'field:selected', fieldName: event.detail?.data?.fieldName },
          window.location.origin
        )
      } else {
        const tinaAdminBasePath = redirect.startsWith('/')
          ? redirect
          : `/${redirect}`
        const tinaAdminPath = `${tinaAdminBasePath}/index.html#/~${window.location.pathname}?active-field=${event.detail.data.fieldName}`
        window.location.assign(tinaAdminPath)
      }
    },
    [edit]
  )

  useEffect(() => {
    window.addEventListener('edit:open', handleOpenEvent)
    return () => {
      window.removeEventListener('edit:open', handleOpenEvent)
    }
  }, [redirect, edit])
}
