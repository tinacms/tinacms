import * as React from 'react'
import { Tina } from '@tinacms/tinacms'

export const wrapRootElement = ({ element }: any, options: any) => {
  return <Tina {...options.sidebar}>{element}</Tina>
}
