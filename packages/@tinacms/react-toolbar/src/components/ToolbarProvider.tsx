import * as React from 'react'
import { Toolbar } from './Toolbar'

interface ToolbarProviderProps {
  hidden?: boolean
}

export function ToolbarProvider({ hidden }: ToolbarProviderProps) {
  if (hidden) return null

  return <Toolbar />
}
