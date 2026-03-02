'use client'

import React, { useState, useContext, useEffect } from 'react'

interface GlobalSettings {
  header?: {
    name?: string
    color?: string
    icon?: any
    nav?: Array<{ href?: string; label?: string }>
  }
  footer?: {
    color?: string
    social?: Array<{ icon?: string; url?: string }>
  }
  theme?: {
    color?: string
    font?: string
    darkMode?: string
  }
}

interface LayoutState {
  globalSettings: GlobalSettings
  theme: {
    color: string
    font: string
    darkMode: string
  }
}

const defaultTheme = {
  color: 'blue',
  font: 'sans',
  darkMode: 'system',
}

const LayoutContext = React.createContext<LayoutState>({
  globalSettings: {},
  theme: defaultTheme,
})

export const useLayout = () => useContext(LayoutContext)

const updateRenderColorMode = (themeMode: 'dark' | 'light') => {
  if (typeof window !== 'undefined') {
    const root = window.document.documentElement
    root.classList.remove('dark')
    root.classList.remove('light')
    root.classList.add(themeMode)
  }
}

const getUserSystemDarkMode = (): 'dark' | 'light' => {
  if (typeof window !== 'undefined') {
    const userMedia = window.matchMedia('(prefers-color-scheme: dark)')
    if (userMedia.matches) {
      return 'dark'
    }
  }
  return 'light'
}

export const LayoutProvider = ({
  children,
  globalSettings,
}: {
  children: React.ReactNode
  globalSettings: GlobalSettings
}) => {
  const theme = {
    color: globalSettings.theme?.color || 'blue',
    font: globalSettings.theme?.font || 'sans',
    darkMode: globalSettings.theme?.darkMode || 'system',
  }

  const [systemDarkMode, setSystemDarkMode] = useState<'dark' | 'light'>(
    getUserSystemDarkMode()
  )

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userMedia = window.matchMedia('(prefers-color-scheme: dark)')
      const updateSystemMediaPreference = (event: MediaQueryListEvent) => {
        setSystemDarkMode(event.matches ? 'dark' : 'light')
      }
      userMedia.addEventListener('change', updateSystemMediaPreference)
      return () =>
        userMedia.removeEventListener('change', updateSystemMediaPreference)
    }
  }, [])

  useEffect(() => {
    updateRenderColorMode(
      theme.darkMode === 'system'
        ? systemDarkMode
        : theme.darkMode === 'dark'
        ? 'dark'
        : 'light'
    )
  }, [systemDarkMode, theme.darkMode])

  return (
    <LayoutContext.Provider value={{ globalSettings, theme }}>
      {children}
    </LayoutContext.Provider>
  )
}
