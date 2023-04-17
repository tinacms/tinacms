import { tinaField, useEditState } from 'tinacms/dist/react'
import { useCallback, useEffect } from 'react'

export const previewField = <
  T extends object & {
    _tina_metadata?: {
      id: string
      name?: string
      fields: Record<string, string>
    }
  }
>(
  obj: T,
  field?: keyof Omit<T, '__typename' | '_sys'>,
  index?: number
) => {
  const href = tinaField(obj, field, index)
  return JSON.stringify({ origin: 'tinacms', href })
}

export const useEditOpen = (redirectPath: string) => {
  const { edit } = useEditState()
  const handleOpenEvent = useCallback(
    (event: CustomEventInit) => {
      if (edit) {
        parent.postMessage({ type: 'field:selected', value: event.detail.href })
      } else {
        const tinaAdminBasePath = redirectPath.startsWith('/')
          ? redirectPath
          : `/${redirectPath}`
        const tinaAdminPath = `${tinaAdminBasePath}/index.html#/~${
          window.location.pathname
        }?activeField=${event.detail.href.replace('#', '__')}`
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
  }, [redirectPath, edit])
}

/**
 * A very rudimentary implementation which triggers events when
 * an element with the correct data attribute is clicked.
 */
export const useEditDemo = () => {
  const handleClick = (e: MouseEvent) => {
    if (e.target instanceof Element) {
      const vercelEditInfo = e.target.getAttribute('data-vercel-edit-info')
      if (vercelEditInfo) {
        // e.stopPropagation()
        const event = new CustomEvent('edit:open', {
          bubbles: true,
          detail: JSON.parse(vercelEditInfo),
        })
        e.target.dispatchEvent(event)
      }
    }
  }
  useEffect(() => {
    document.addEventListener('mousedown', handleClick)
    return () => {
      return document.removeEventListener('mousedown', handleClick)
    }
  }, [])
}
