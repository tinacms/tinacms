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
import * as React from 'react'

export const MutationSignalContext = React.createContext(-1)

/**
 *
 */
export const MutationSignalProvider = ({ children }: { children: any }) => {
  const observerAreaRef = React.useRef<HTMLElement | null>(null)
  const [signal, setSignal] = React.useState(0)
  React.useEffect(() => {
    if (!observerAreaRef) return

    const observer = new MutationObserver(() => setSignal((s) => s + 1))
    observer.observe(observerAreaRef.current as Node, {
      childList: true,
      subtree: true,
      characterData: true,
    })
    return () => observer.disconnect()
  }, [])
  return (
    <MutationSignalContext.Provider value={signal}>
      <div ref={observerAreaRef as any}>{children}</div>
    </MutationSignalContext.Provider>
  )
}

/**
 * Returns a value that changes when elements within the parent MutationSignalProvider change
 */
export const useMutationSignal = () => React.useContext(MutationSignalContext)
