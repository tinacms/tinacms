import * as React from 'react'

export class CMS {
  //
}

export const CMSContext = React.createContext<CMS | null>(null)

export function useCMS(): CMS {
  let cms = React.useContext(CMSContext)

  if (!cms) {
    throw new Error('No CMS provided')
  }

  return cms
}
