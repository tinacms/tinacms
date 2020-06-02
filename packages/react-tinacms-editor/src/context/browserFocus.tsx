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
import { useEffect, useState, ReactElement } from 'react'
import { createContext, useContext } from 'react'

const BrowserFocusContext = createContext<{
  browserFocused: boolean
}>({
  browserFocused: true,
})

export const BrowserFocusProvider = ({
  children,
}: {
  children: ReactElement
}) => {
  const [browserFocused, setBrowserFocused] = useState(true)

  useEffect(() => {
    const setWindowFocused = () => setBrowserFocused(true)
    const setWindowBlurred = () => setBrowserFocused(false)
    window.addEventListener('focus', setWindowFocused)
    window.addEventListener('blur', setWindowBlurred)
    return () => {
      window.removeEventListener('focus', setWindowFocused)
      window.removeEventListener('blur', setWindowBlurred)
    }
  }, [])

  return (
    <BrowserFocusContext.Provider value={{ browserFocused }}>
      {children}
    </BrowserFocusContext.Provider>
  )
}

export const BrowserFocusConsumer = BrowserFocusContext.Consumer

export const useBrowserFocusContext = () => ({
  ...useContext(BrowserFocusContext),
})
