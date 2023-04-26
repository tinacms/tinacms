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
  const isEdit = useKeyPress()

  React.useEffect(() => {
    parent.postMessage(
      { type: 'hotkey', value: isEdit },
      window.location.origin
    )
  }, [isEdit])

  React.useEffect(() => {
    parent.postMessage({ type: 'open', ...props, id }, window.location.origin)
    window.addEventListener('message', (event) => {
      if (event.data.id === id && event.data.type === 'updateData') {
        setData(event.data.data)
      }
    })

    const mutationCallback = () => {
      const nodeList = document.querySelectorAll('[data-tinafield]')
      const elementList: { fieldName: string; rect: DOMRect }[] = []
      for (const node of nodeList) {
        elementList.push({
          fieldName: node.getAttribute('data-tinafield'),
          rect: node.getBoundingClientRect(),
        })
      }
      parent.postMessage(
        { type: 'tinafields', elementList },
        window.location.origin
      )
    }

    const mutationObserver = new MutationObserver(mutationCallback)

    const observer = new ResizeObserver(() => {
      const htmlElement = document.querySelector('html')
      parent.postMessage(
        { type: 'window-size', height: htmlElement.scrollHeight },
        window.location.origin
      )
      mutationCallback()
    })
    observer.observe(document.body)
    mutationObserver.observe(document.body, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    })

    return () => {
      parent.postMessage({ type: 'close', id }, window.location.origin)
    }
  }, [id])

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

function useKeyPress() {
  const targetKey = 'e'
  const metaKey = 'Meta'
  // State for keeping track of whether key is pressed
  const [keyPressed, setKeyPressed] = React.useState<boolean>(false)
  const [metaPressed, setMetaPressed] = React.useState<boolean>(false)
  const [isEdit, setIsEdit] = React.useState(false)

  const hotkey = keyPressed && metaPressed
  // React.useEffect(() => {
  //   if (hotkey) {
  //     setIsEdit((edit) => !edit)
  //   }
  // }, [hotkey])
  // If pressed key is our target key then set to true
  const downHandler = React.useCallback(
    function downHandler({ key }) {
      if (key === targetKey) {
        setKeyPressed(true)
      }
      if (key === metaKey) {
        setMetaPressed(true)
      }
    },
    [metaPressed]
  )
  // If released key is our target key then set to false
  const upHandler = ({ key }) => {
    if (key === targetKey) {
      setKeyPressed(false)
    }
    if (key === metaKey) {
      setMetaPressed(false)
    }
  }
  // Add event listeners
  React.useEffect(() => {
    window.addEventListener('keydown', downHandler)
    window.addEventListener('keyup', upHandler)
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', downHandler)
      window.removeEventListener('keyup', upHandler)
    }
  }, []) // Empty array ensures that effect is only run on mount and unmount
  return hotkey
}
