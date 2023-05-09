import React from 'react'

export function useTina<T extends object>(props: {
  query: string
  variables: object
  data: T
}): { data: T; isClient: boolean } {
  const [data, setData] = React.useState(props.data)
  const [isClient, setIsClient] = React.useState(false)
  const [quickEditEnabled, setQuickEditEnabled] = React.useState(false)

  const id = JSON.stringify({ query: props.query, variables: props.variables })
  React.useEffect(() => {
    setIsClient(true)
    setData(props.data)
  }, [id])

  React.useEffect(() => {
    if (!quickEditEnabled) {
      return
    }
    const style = document.createElement('style')
    style.type = 'text/css'
    style.textContent = `
    [data-tinafield] {
      box-shadow: inset 100vi 100vh rgba(110, 163, 216, 0.1);
      outline: 2px solid rgba(110, 163, 216, 0.2);
      cursor: pointer;
      transition: ease-in-out 200ms;
    }
    [data-tinafield]:not(:has([data-tinafield]:hover)):hover {
      box-shadow: inset 100vi 100vh rgba(110, 163, 216, 0.4);
      outline: 2px solid rgba(110, 163, 216, 0.9);
      cursor: pointer;
    }
    `
    document.head.appendChild(style)

    function mouseDownHandler(e) {
      const fieldName = e.target?.dataset['tinafield']
      if (e.target?.dataset && fieldName) {
        e.preventDefault()
        e.stopPropagation()
        parent.postMessage(
          { type: 'field:selected', fieldName },
          window.location.origin
        )
      } else {
        const ancestor = e.target.closest('[data-tinafield]')
        if (ancestor) {
          const fieldName = ancestor.dataset['tinafield']
          e.preventDefault()
          e.stopPropagation()
          parent.postMessage(
            { type: 'field:selected', fieldName },
            window.location.origin
          )
        }
      }
    }
    document.addEventListener('mousedown', mouseDownHandler, true)

    return () => {
      document.removeEventListener('mousedown', mouseDownHandler)
      style.remove()
    }
  }, [quickEditEnabled])

  React.useEffect(() => {
    parent.postMessage({ type: 'open', ...props, id }, window.location.origin)
    window.addEventListener('message', (event) => {
      if (event.data.type === 'quickEditEnabled') {
        setQuickEditEnabled(event.data.value)
      }
      if (event.data.id === id && event.data.type === 'updateData') {
        setData(event.data.data)
        // Ensure we still have a tinafield on the page
        const anyTinaField = document.querySelector('[data-tinafield]')
        if (anyTinaField) {
          parent.postMessage(
            { type: 'quick-edit', value: true },
            window.location.origin
          )
        } else {
          parent.postMessage(
            { type: 'quick-edit', value: false },
            window.location.origin
          )
        }
      }
    })

    return () => {
      parent.postMessage({ type: 'close', id }, window.location.origin)
    }
  }, [id, setQuickEditEnabled])
  return { data, isClient } as any
}

export function useEditState(): { edit: boolean } {
  const [edit, setEdit] = React.useState(false)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      parent.postMessage({ type: 'isEditMode' }, window.location.origin)
      window.addEventListener('message', (event) => {
        if (event.data?.type === 'tina:editMode') {
          setEdit(true)
        }
      })
    }
  }, [])
  return { edit } as any
}

/**
 * Grab the field name for the given attribute
 * to signal to Tina which DOM element the field
 * is working with.
 */
export const tinaField = <
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
  if (!field) {
    return `${obj._tina_metadata?.id}#${obj._tina_metadata?.name}`
  }
  if (obj?._tina_metadata && obj._tina_metadata?.fields) {
    if (typeof field === 'string') {
      const value = `${obj._tina_metadata?.id}#${obj._tina_metadata.fields[field]}`
      if (typeof index === 'number') {
        return `${value}.${index}`
      } else {
        return value
      }
    }
  }
  return ''
}
