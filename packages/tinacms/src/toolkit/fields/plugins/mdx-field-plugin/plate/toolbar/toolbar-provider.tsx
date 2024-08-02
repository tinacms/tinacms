import React from 'react'
import { createContext, useContext, type ReactNode } from 'react'

import type { MdxTemplate } from '../types'
import type { Form } from '@toolkit/forms'

interface ToolbarContextProps {
  tinaForm: Form
  templates: MdxTemplate[]
  overrides: unknown[]
}

interface ToolbarProviderProps extends ToolbarContextProps {
  children: ReactNode
}

const ToolbarContext = createContext<ToolbarContextProps | undefined>(undefined)

export const ToolbarProvider: React.FC<ToolbarProviderProps> = ({
  tinaForm,
  templates,
  overrides,
  children,
}) => {
  return (
    <ToolbarContext.Provider value={{ tinaForm, templates, overrides }}>
      {children}
    </ToolbarContext.Provider>
  )
}

export const useToolbarContext = (): ToolbarContextProps => {
  const context = useContext(ToolbarContext)
  if (!context) {
    throw new Error('useToolbarContext must be used within a ToolbarProvider')
  }
  return context
}
