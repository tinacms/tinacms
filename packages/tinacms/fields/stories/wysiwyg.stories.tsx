import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { Wysiwyg } from '../src/Wysiwyg'

const Basic = () => {
  let [value, setValue] = React.useState('')
  return (
    <Wysiwyg
      input={{
        value,
        onChange: (val: string) => {
          console.log(val)
          setValue(val)
        },
      }}
    />
  )
}

storiesOf('Wysiwyg', module).add('Basic', () => <Basic />)
