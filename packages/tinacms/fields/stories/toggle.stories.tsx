import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { Toggle } from '../src/Toggle'

storiesOf('Toggle', module).add('Default', () => <BasicExample />)

function BasicExample() {
  return (
    <Toggle
      name=""
      onBlur={() => {}}
      onChange={() => {}}
      onFocus={() => {}}
      value=""
    />
  )
}
