import * as React from 'react'
import { TinaGlobalStyles } from './Styles'
import { FontLoader } from './FontLoader'

export function StyleProvider() {
  return (
    <>
      <FontLoader active={true} />
      <TinaGlobalStyles />
    </>
  )
}
