import * as React from 'react'
import { TinaGlobalStyles } from './Styles'
import { FontLoader } from './FontLoader'

interface StyleProviderProps {
  active: boolean
}

export function StyleProvider({ active }: StyleProviderProps) {
  if (!active) return null

  return (
    <>
      <FontLoader load={true} />
      <TinaGlobalStyles />
    </>
  )
}
