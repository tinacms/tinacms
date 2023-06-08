import { vercelStegaCombine } from '@vercel/stega'
import React from 'react'
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

export const useVisualEditing = <T extends object>({
  data,
  query,
  variables,
  enabled,
  redirect,
  stringEncoding,
}: {
  data: T
  query: string
  variables: object
  enabled: boolean
  redirect: string
  stringEncoding:
    | boolean
    | { skipPaths: (path: string, value: string) => boolean }
}): T => {
  const stringifiedQuery = JSON.stringify({
    query: query,
    variables: variables,
  })
  const id = React.useMemo(
    () => hashFromQuery(stringifiedQuery),
    [stringifiedQuery]
  )
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

  function appendMetadata<T>(
    obj: T,
    path: (string | number)[] = [],
    id: string
  ): T {
    if (typeof obj !== 'object' || obj === null) {
      if (typeof obj === 'string' && stringEncoding) {
        if (typeof stringEncoding === 'boolean') {
          if (stringEncoding) {
            return encodeEditInfo(path, obj, id) as any
          }
        } else if (stringEncoding.skipPaths) {
          if (!stringEncoding.skipPaths(path.join('.'), obj)) {
            return encodeEditInfo(path, obj, id) as any
          }
        }
      }
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map((item, index) =>
        appendMetadata(item, [...path, index], id)
      ) as unknown as T // Handle arrays recursively
    }

    const transformedObj = {} as T
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = [...path, key]
      if (
        [
          '__typename',
          '_sys',
          '_internalSys',
          '_values',
          '_internalValues',
          '_content_source',
          '_tina_metadata',
        ].includes(key)
      ) {
        transformedObj[key] = value
      } else {
        transformedObj[key] = appendMetadata(value, currentPath, id)
      }
    }

    return { ...transformedObj, _content_source: { queryId: id, path } }
  }
  if (enabled) {
    return appendMetadata(data, [], id)
  }
  return data
}

function encodeEditInfo(path: (string | number)[], value: string, id: string) {
  return vercelStegaCombine(value, {
    origin: 'tina.io',
    data: { fieldName: `${id}---${path.join('.')}` },
  })
}

export const hashFromQuery = (input: string) => {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash + char) & 0xffffffff // Apply bitwise AND to ensure non-negative value
  }
  const nonNegativeHash = Math.abs(hash)
  const alphanumericHash = nonNegativeHash.toString(36)
  return alphanumericHash
}
