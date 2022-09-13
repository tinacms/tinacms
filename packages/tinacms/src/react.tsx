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
  React.useEffect(() => {
    const id = btoa(JSON.stringify({ query: props.query }))
    parent.postMessage({ type: 'open', ...props, id }, window.location.origin)
    window.addEventListener('message', (event) => {
      if (event.data.id === id) {
        console.log('child: event received')
        setData(event.data.data)
      }
    })

    return () =>
      parent.postMessage({ type: 'close', id }, window.location.origin)
  }, [])
  return { data } as any
}
