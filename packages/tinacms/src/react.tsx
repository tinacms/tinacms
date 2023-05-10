import React from 'react'

export function useTina(props) {
  const [data, setData] = React.useState(props.data)
  const [isClient, setIsClient] = React.useState(false)
  const [quickEditEnabled, setQuickEditEnabled] = React.useState(false)

  const id = JSON.stringify({ query: props.query, variables: props.variables })
  React.useEffect(() => {
    setIsClient(true)
    setData(props.data)
  }, [id])

  React.useEffect(() => {
    if (quickEditEnabled) {
      const style = document.createElement('style')
      style.type = 'text/css'
      style.textContent = `
        [data-tinafield] {
          box-shadow: inset 100vi 100vh rgba(110, 163, 216, 0.1);
          outline: 2px solid rgba(110, 163, 216);
          cursor: pointer;
          transition: ease-in-out 200ms;
        }
        [data-tinafield]:hover {
          box-shadow: inset 100vi 100vh rgba(110, 163, 216, 0.4);
          outline: 3px solid rgba(110, 163, 216);
        }
        [data-tinafield-overlay] {
          outline: 2px solid rgba(110, 163, 216);
          cursor: pointer;
          transition: ease-in-out 200ms;
          position: relative;
        }
        [data-tinafield-overlay]::after {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 20;
          background-color: rgba(110, 163, 216, 0.2);
        }
        [data-tinafield-overlay]:hover::after {
          background-color: rgba(110, 163, 216, 0.4);
        }
      `
      document.head.appendChild(style)
      document.body.classList.add('__tina-quick-editing-enabled')

      function mouseDownHandler(e) {
        const attributeNames = e.target.getAttributeNames()
        // If multiple attributes start with data-tinafield, only the first is used
        const tinaAttribute = attributeNames.find((name) =>
          name.startsWith('data-tinafield')
        )
        if (tinaAttribute) {
          e.preventDefault()
          e.stopPropagation()
          const fieldName = e.target.getAttribute(tinaAttribute)
          parent.postMessage(
            { type: 'field:selected', fieldName },
            window.location.origin
          )
        } else {
          const ancestor = e.target.closest(
            '[data-tinafield], [data-tinafield-overlay]'
          )
          if (ancestor) {
            const attributeNames = ancestor.getAttributeNames()
            const tinaAttribute = attributeNames.find((name) =>
              name.startsWith('data-tinafield')
            )
            if (tinaAttribute) {
              e.preventDefault()
              e.stopPropagation()
              const fieldName = ancestor.getAttribute(tinaAttribute)
              console.log({
                ancestor,
                attributeNames,
                tinaAttribute,
                fieldName,
              })
              parent.postMessage(
                { type: 'field:selected', fieldName },
                window.location.origin
              )
            }
          }
        }
      }
      document.addEventListener('click', mouseDownHandler, true)

      return () => {
        document.removeEventListener('click', mouseDownHandler, true)
        document.body.classList.remove('__tina-quick-editing-enabled')
        style.remove()
      }
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
  return { data, isClient }
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
