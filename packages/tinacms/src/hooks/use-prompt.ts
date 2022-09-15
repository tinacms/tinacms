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

import { History, Transition } from 'history'
import { useCallback, useContext, useEffect } from 'react'
import { Navigator } from 'react-router'
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom'

type ExtendNavigator = Navigator & Pick<History, 'block'>
export function useBlocker(blocker: (_tx: Transition) => void, when = true) {
  const { navigator } = useContext(NavigationContext)

  useEffect(() => {
    if (!when) return

    const unblock = (navigator as ExtendNavigator).block((tx) => {
      const autoUnblockingTx = {
        ...tx,
        retry() {
          unblock()
          tx.retry()
        },
      }

      blocker(autoUnblockingTx)
    })

    return unblock
  }, [navigator, blocker, when])
}

export default function usePrompt(message: string, when = true) {
  const blocker = useCallback(
    (tx: Transition) => {
      if (window.confirm(message)) tx.retry()
    },
    [message]
  )

  useBlocker(blocker, when)
}
