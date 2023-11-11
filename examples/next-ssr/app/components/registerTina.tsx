'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

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

export const RegisterTina = (props: { query; variables; data }) => {
  const router = useRouter()
  const stringifiedQuery = JSON.stringify({
    query: props.query,
    variables: props.variables,
  })
  const id = React.useMemo(
    () => hashFromQuery(stringifiedQuery),
    [stringifiedQuery]
  )

  React.useEffect(() => {
    parent.postMessage({ type: 'open', ...props, id }, window.location.origin)

    window.addEventListener('message', (event) => {
      if (event.data.id === id && event.data.type === 'updateData') {
        console.log('updateData', event.data.data)
        // add event.data.data to URL

        // window.location.href = window.location.href

        //remove all fields that start with underscore from props.data and event.data.data and check for differences
        // if there are differences, then add event.data.data to URL

        // if there are no differences, then do nothing

        const filterOutUnderscoreFields = (obj) => {
          if (Array.isArray(obj)) {
            return obj.map(filterOutUnderscoreFields)
          } else if (obj !== null && typeof obj === 'object') {
            return Object.fromEntries(
              Object.entries(obj)
                .filter(([key]) => !key.startsWith('_'))
                .filter(([key]) => key != 'id')
                .map(([key, value]) => [key, filterOutUnderscoreFields(value)])
            )
          }
          return obj
        }

        if (
          JSON.stringify(filterOutUnderscoreFields(event.data.data)) !==
          JSON.stringify(filterOutUnderscoreFields(props.data))
        ) {
          router.replace(
            `${window.location.pathname}?` +
              encodeURIComponent(JSON.stringify(event.data.data))
          )
        }
      }
    })

    return () => {
      // parent.postMessage({ type: 'close', id }, window.location.origin)
    }
  }, [id])

  return <></>
}
