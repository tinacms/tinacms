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
