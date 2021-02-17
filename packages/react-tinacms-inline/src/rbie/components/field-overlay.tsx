/**

Copyright 2019 Forestry.io Inc

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

function useWindowResize(handler: () => void) {
  React.useEffect(() => {
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
}

export function FieldOverlay({
  targetNode,
  attention,
  children,
}: {
  targetNode: any
  attention: boolean
  children?: JSX.Element
}) {
  const [, setState] = React.useState(0)
  useWindowResize(() => setState(s => s + 1))
  if (!targetNode) return null
  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 400,
        top: targetNode?.offsetTop,
        left: targetNode?.offsetLeft,
        width: targetNode?.offsetWidth,
        height: targetNode?.offsetHeight,
        border: attention ? '1px solid var(--tina-color-primary)' : 'none',
        pointerEvents: attention ? 'none' : 'initial',
      }}
    >
      {children}
    </div>
  )
}
