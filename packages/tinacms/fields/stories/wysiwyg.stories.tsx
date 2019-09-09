import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { Wysiwyg } from '../src/Wysiwyg'

const Basic = () => {
  return <Wysiwyg input={{ value: '## Hello Everyone' }} />
}

storiesOf('Wysiwyg', module).add('Basic', () => <Basic />)
