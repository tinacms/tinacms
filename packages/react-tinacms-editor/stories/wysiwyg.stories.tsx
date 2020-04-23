/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { Wysiwyg } from '../src'

const Basic = () => {
  const [value, setValue] = React.useState('')
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

const HTMLFormat = () => {
  const [value, setValue] = React.useState('<p>testing...</p>')
  return (
    <Wysiwyg
      input={{
        value,
        onChange: (val: string) => {
          console.log(val)
          setValue(val)
        },
      }}
      format="html"
    />
  )
}

const WithImage = () => {
  const [value, setValue] = React.useState(
    `![alt text](https://i.imgur.com/2FCfbgg.jpg "Logo Title Text 1")
    test
    test
    ![alt text](https://i.imgur.com/2FCfbgg.jpg "Logo Title Text 1")`
  )
  return (
    <Wysiwyg
      input={{
        value,
        onChange: (val: string) => {
          console.log(val)
          setValue(val)
        },
      }}
      imageProps={{
        upload: (files: File[]) => {
          console.log(files)
          return new Promise(resolve => {
            setTimeout(function() {
              resolve([
                'https://i.imgur.com/2FCfbgg.jpg',
                'https://i7.fnp.com/images/pr/l/v20180606180223/white-n-red-floral-beauty_1.jpg',
              ])
            }, 250)
          })
        },
        previewUrl: (str: string) => str,
      }}
    />
  )
}

const WithTable = () => {
  const [value, setValue] = React.useState(
    `| A | B | C |
| --- | --- | ---:|
| aaa | bbb | ccc |
| aaa | bbb | ccc |`
  )
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

storiesOf('Wysiwyg', module)
  .add('Basic', () => <Basic />)
  .add('HTML Format', () => <HTMLFormat />)
  .add('WithImage', () => <WithImage />)
  .add('WithTable', () => <WithTable />)
