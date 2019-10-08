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
import { ImageUpload } from '../src/ImageUpload'
import { useState } from 'react'

const ImageUploader = () => {
  const [img, setImg] = useState<string>()

  return (
    <ImageUpload
      onDrop={() => {
        setImg(
          'https://images.unsplash.com/photo-1518259102261-b40117eabbc9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2550&q=80'
        )
      }}
      value={img}
    />
  )
}

storiesOf('Fileupload', module).add('Image', () => <ImageUploader />)
