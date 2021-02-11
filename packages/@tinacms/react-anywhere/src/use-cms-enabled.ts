import * as React from 'react'

export const CMSEnabledContext = React.createContext(false)

export const useCMSEnabled = () => {
  return React.useContext(CMSEnabledContext)
}
