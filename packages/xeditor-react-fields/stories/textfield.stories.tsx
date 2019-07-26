import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { TextField } from '../src/fields/TextField'

storiesOf('Button', module)
  .add('with text', () => <button>Hello Button</button>)
  .add('with emoji', () => (
    <button>
      <span role="img" aria-label="so cool">
        😀 😎 👍 💯
      </span>
    </button>
  ))

storiesOf('Textfield', module).add('with text', () => <TextField />)
