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
import { Theme_Document } from '../.tina/__generated__/types'

export const ThemeContext = React.createContext(null as any)

const getInitialThemeMode = (_) => {
  if (typeof window !== 'undefined') {
    if (window.localStorage) {
      const storedPrefs = window.localStorage.getItem('theme-mode')

      if (typeof storedPrefs === 'string') {
        return storedPrefs
      }
    }

    const userMedia = window.matchMedia('(prefers-color-scheme: dark)')

    if (userMedia.matches) {
      return 'dark'
    }
  }

  return 'light'
}

const updateRenderColorMode = (themeMode) => {
  if (typeof window !== 'undefined') {
    const root = window.document.documentElement
    root.classList.remove('dark')
    root.classList.remove('light')
    root.classList.add(themeMode)
  }
}

export const Theme: React.FC<{
  theme: {
    getThemeDocument: Theme_Document
  }
}> = ({ children, theme }) => {
  const [themeMode, setThemeMode] = React.useState(getInitialThemeMode(''))

  const toggleThemeMode = () => {
    let newMode = ''

    if (themeMode === 'light') {
      newMode = 'dark'
    } else {
      newMode = 'light'
    }

    setThemeMode(newMode)

    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('theme-mode', newMode)
    }
  }

  React.useEffect(() => {
    updateRenderColorMode(themeMode)
  }, [themeMode])

  const themeData = theme.getThemeDocument.data
  return (
    <ThemeContext.Provider value={{ themeMode, toggleThemeMode, ...themeData }}>
      {children}
    </ThemeContext.Provider>
  )
}
