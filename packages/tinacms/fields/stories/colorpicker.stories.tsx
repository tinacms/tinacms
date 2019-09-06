import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { ColorPicker } from '../src/ColorPicker'
import { ColorFormat } from '../src/ColorPicker/color-formatter'

storiesOf('ColorPicker', module).add('Hex', () => <BasicExample />)

function BasicExample() {
  let [value, setValue] = React.useState()
  return (
    <ColorPicker
      colorFormat={ColorFormat.Hex}
      input={{ value, onChange: setValue }}
    />
  )
}
