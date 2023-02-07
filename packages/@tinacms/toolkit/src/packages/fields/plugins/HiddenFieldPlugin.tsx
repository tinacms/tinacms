/**



*/

import * as React from 'react'
import { parse } from './textFormat'

export const HiddenField = () => {
  return <></>
}

export const HiddenFieldPlugin = {
  name: 'hidden',
  Component: HiddenField,
  parse,
}
