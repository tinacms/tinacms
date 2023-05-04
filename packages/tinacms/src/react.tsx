import React from 'react'

export function useTina<T extends object>(props: {
  query: string
  variables: object
  data: T
}): { data: T; isClient: boolean } {
  const [data, setData] = React.useState(props.data)
  const [isClient, setIsClient] = React.useState(false)
  const id = JSON.stringify({ query: props.query, variables: props.variables })
  React.useEffect(() => {
    setIsClient(true)
    setData(props.data)
  }, [id])
  const [quickEditEnabled, setQuickEditEnabled] = React.useState(false)
  const [editingReady, setEditingReady] = React.useState(false)

  React.useEffect(() => {
    if (!editingReady) {
      clearElementContainer()
      return
    }
    if (quickEditEnabled) {
      addElementContainer()
      updateElementList()
    } else {
      clearElementContainer()
    }
  }, [quickEditEnabled, editingReady])

  React.useEffect(() => {
    const style = document.createElement('style')
    style.type = 'text/css'
    style.textContent = `
.tina-click-edit-button {
  border: 2px dashed rgb(107 182 248);
  border-radius: 3px;
  transition: background-color 0.5s ease;
  pointer-events: auto;
}
.tina-click-edit-button:hover {
  background-color: rgb(197 221 239 / 40%);
  border: 2px dashed rgb(22 110 188);
}
    `
    document.head.appendChild(style)

    return () => {
      style.remove()
    }
  }, [])

  const clearElementContainer = () => {
    const prevContainer = document.querySelector('#tina-click-edit-container')
    prevContainer?.remove()
  }
  const addElementContainer = () => {
    const prevContainer = document.querySelector('#tina-click-edit-container')
    prevContainer?.remove()
    const container = document.createElement('div')
    container.id = 'tina-click-edit-container'
    container.style['z-index'] = `20000`
    container.style.position = `absolute`
    container.style.pointerEvents = `none`
    container.style.top = `0`
    container.style.left = `0`
    container.style.right = `0`
    container.style.bottom = `0`
    document.body.append(container)
  }

  const updateElementList = () => {
    const container = document.querySelector('#tina-click-edit-container')
    const nodeList = document.querySelectorAll('[data-tinafield]')
    if (nodeList.length > 0) {
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
    if (!container) {
      return
    }
    container.innerHTML = ''
    const elementList: { fieldName: string; rect: DOMRect }[] = []
    for (const node of nodeList) {
      const fieldName = node.getAttribute('data-tinafield')

      const rect = node.getBoundingClientRect()
      elementList.push({
        fieldName,
        rect,
      })
      const button = document.createElement('button')
      button.addEventListener('mousedown', () => {
        parent.postMessage(
          {
            type: 'field:selected',
            fieldName,
          },
          window.location.origin
        )
      })
      button.style.position = 'absolute'
      button.style.top = `${rect.top + window.scrollY}px`
      button.style.left = `${rect.left + window.scrollX}px`
      button.style.width = `${rect.width}px`
      button.style.height = `${rect.height}px`
      button.className = 'tina-click-edit-button'
      container.append(button)
    }
  }

  React.useEffect(() => {
    parent.postMessage({ type: 'open', ...props, id }, window.location.origin)
    window.addEventListener('message', (event) => {
      if (event.data.type === 'quickEditEnabled') {
        setQuickEditEnabled(event.data.value)
      }
      if (event.data.id === id && event.data.type === 'updateData') {
        setData(event.data.data)
        updateElementList()
        setEditingReady(true)
      }
    })

    const observer = new ResizeObserver(() => {
      updateElementList()
    })
    observer.observe(document.body)

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
