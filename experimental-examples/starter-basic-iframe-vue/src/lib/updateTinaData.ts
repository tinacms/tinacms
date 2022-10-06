export const updateTinaData = (data: any, setData: (data: any) => void) => {
  const id = btoa(JSON.stringify({ query: data.query }))
  parent.postMessage(
    JSON.parse(
      JSON.stringify({
        type: 'open',
        id,
        data: data.data,
        query: data.query,
        variables: data.variables,
      })
    ),
    window.location.origin
  )
  window.addEventListener('message', (event) => {
    console.log('child received message', event)
    if (event.data.id === id) {
      console.log('child: event received')
      setData(event.data)
    }
  })
}
