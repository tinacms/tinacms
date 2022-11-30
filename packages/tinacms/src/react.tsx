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
import React from 'react'

/**
 * This is an experimental version of the useTina hook,
 * it is only meant to be used with Tina in "iframe mode".
 */
export function useTina<T extends object>(props: {
  query: string
  variables: object
  data: T
}): { data: T } {
  const [data, setData] = React.useState(props.data)
  const id = JSON.stringify({ query: props.query, variables: props.variables })
  React.useEffect(() => {
    setData(props.data)
  }, [id])
  React.useEffect(() => {
    parent.postMessage({ type: 'open', ...props, id }, window.location.origin)
    window.addEventListener('message', (event) => {
      if (event.data.id === id && event.data.type === 'updateData') {
        setData(event.data.data)
      }
    })

    return () =>
      parent.postMessage({ type: 'close', id }, window.location.origin)
  }, [id])
  return { data } as any
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
    __meta__?: { id: string; name?: string; fields: Record<string, string> }
  }
>(
  obj: T,
  field?: keyof Omit<T, '__typename' | '_sys'>
) => {
  if (!field) {
    return `${obj.__meta__?.id}#${obj.__meta__?.name}`
  }
  if (obj?.__meta__) {
    if (typeof field === 'string') {
      return `${obj.__meta__?.id}#${obj.__meta__.fields[field]}`
    }
  }
  return ''
}
