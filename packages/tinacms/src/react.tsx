import React from 'react'

export function useTina<T extends object>(props: {
  query: string
  variables: object
  data: T
}): { data: T; isClient: boolean } {
  const [data, setData] = React.useState(props.data)
  const [isClient, setIsClient] = React.useState(false)
  const [operationIndex, setOperationIndex] = React.useState(0)
  const id = JSON.stringify({ query: props.query, variables: props.variables })
  React.useEffect(() => {
    setIsClient(true)
    setData(props.data)
  }, [id])
  const [isEdit, setIsEdit] = React.useState(false)
  const [isEditable, setIsEditable] = React.useState(false)

  React.useEffect(() => {
    if (!isEditable) {
      clearElementContainer()
      return
    }
    if (isEdit) {
      addElementContainer()
      updateElementList()
    } else {
      clearElementContainer()
    }
  }, [isEdit, isEditable])

  React.useEffect(() => {
    const style = document.createElement('style')
    style.type = 'text/css'
    style.textContent = `
.tina-click-edit-button {
  background-color: rgb(169 212 251);
  opacity: 0.2;
  border: 2px dashed rgb(117 142 164);
}
.tina-click-edit-button:hover { opacity: 0.4;}
    `
    document.head.appendChild(style)
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
    container.style.top = `0`
    container.style.left = `0`
    container.style.right = `0`
    container.style.bottom = `0`
    document.body.append(container)
  }

  const updateElementList = () => {
    const container = document.querySelector('#tina-click-edit-container')
    if (!container) {
      return
    }
    container.innerHTML = ''
    const nodeList = document.querySelectorAll('[data-tinafield]')
    const elementList: { fieldName: string; rect: DOMRect }[] = []
    for (const node of nodeList) {
      const rect = node.getBoundingClientRect()
      elementList.push({
        fieldName: node.getAttribute('data-tinafield'),
        rect,
      })
      const button = document.createElement('button')
      button.addEventListener('mousedown', () => {
        parent.postMessage({
          type: 'field:selected',
          fieldName: node.getAttribute('data-tinafield'),
        })
      })
      button.style.position = 'absolute'
      button.style.top = `${rect.top + window.scrollY}px`
      button.style.left = `${rect.left + window.scrollX}px`
      button.style.width = `${rect.width}px`
      button.style.height = `${rect.height}px`
      button.className = 'tina-click-edit-button'
      container.append(button)
    }
    parent.postMessage(
      { type: 'tinafields', elementList },
      window.location.origin
    )
  }

  React.useEffect(() => {
    updateElementList()
  }, [operationIndex])

  React.useEffect(() => {
    parent.postMessage({ type: 'open', ...props, id }, window.location.origin)
    window.addEventListener('message', (event) => {
      if (event.data.type === 'isEdit') {
        setIsEdit(event.data.value)
      }
      if (event.data.id === id && event.data.type === 'updateData') {
        setData(event.data.data)
        setOperationIndex((i) => i + 1)
        setIsEditable(true)
      }
    })

    const observer = new ResizeObserver(() => {
      updateElementList()
    })
    observer.observe(document.body)

    return () => {
      parent.postMessage({ type: 'close', id }, window.location.origin)
    }
  }, [id, setIsEdit])

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
