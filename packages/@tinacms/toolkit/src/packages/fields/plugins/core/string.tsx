import React from 'react'
import { BaseTextField } from '../../components'
import { TinaFieldProps } from '../../../form-builder'
import { Wrap } from '../..'

export const String = (props: TinaFieldProps) => {
  if (props.field?.ui?.component) {
    if (typeof props.field.ui.component === 'string') {
    } else {
      const Component = props.field?.ui?.component
      return <Component {...props} />
    }
  }
  return (
    <Wrap {...props}>
      <BaseTextField {...props.input} />
    </Wrap>
  )
}
