import * as React from 'react'
import { Toolbar } from './Toolbar'
import { ToolbarState } from '../toolbar'

interface ToolbarProviderProps {
  toolbar: ToolbarState
  hidden?: boolean
}

export function ToolbarProvider({ hidden, toolbar }: ToolbarProviderProps) {
  React.useEffect(() => {
    if (typeof hidden !== 'undefined') {
      toolbar.hidden = hidden
    }
  }, [hidden])

  if (toolbar.hidden) return null

  return <Toolbar />
}
