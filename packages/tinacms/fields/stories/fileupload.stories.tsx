import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { FileUpload } from '../src/FileUpload'

storiesOf('Fileupload', module)
  .add('Default', () => <FileUpload />)