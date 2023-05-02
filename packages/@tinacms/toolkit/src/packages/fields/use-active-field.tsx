import React from 'react'
import { useCMS } from '../react-core'

export const useActiveFieldCallback = (name: string, callback: () => void) => {
  const cms = useCMS()
  React.useEffect(() => {
    if (cms.state.activeFieldName === name) {
      setTimeout(() => {
        callback()
      }, 150)
    }
  }, [cms.state.activeFieldName, name])
}
