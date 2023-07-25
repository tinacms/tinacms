import * as React from 'react'
import { parse } from './text-format'

export const HiddenField = () => {
  return <></>
}

export const HiddenFieldPlugin = {
  name: 'hidden',
  Component: HiddenField,
  parse,
}
