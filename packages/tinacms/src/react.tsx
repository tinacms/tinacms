import React from 'react'

export function useTina<T extends object>(props: {
  query: string
  variables: object
  data: T
}): { data: T } {
  const [data, setData] = React.useState(props.data)
  React.useEffect(() => {
    const id = btoa(JSON.stringify({ query: props.query }))
    parent.postMessage({ type: 'open', ...props, id })
    window.addEventListener('message', (event) => {
      if (event.data.id === id) {
        console.log('child: event received')
        setData(event.data.data)
      }
    })

    return () => parent.postMessage({ type: 'close', id })
  }, [])
  return { data } as any
}
