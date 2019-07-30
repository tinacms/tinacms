import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { TextField } from '../src/TextField'

storiesOf('Textfield', module)
  .add('with text', () => <TextField />)
  .add('with button', () => <TextField  />)
