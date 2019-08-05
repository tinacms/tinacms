import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { TextArea } from '../src/TextArea'

storiesOf('Textarea', module)
  .add('Default', () => <TextArea />)
  .add('Auto height', () => <TextArea />)
