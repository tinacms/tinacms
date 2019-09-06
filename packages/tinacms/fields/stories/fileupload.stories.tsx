import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { ImageDropzone } from '../src/ImageDropzone'
import { useState } from 'react'

const FileUploader = () => {
  let [img, setImg] = useState<string>()

  return (
    <ImageDropzone
      onDrop={() => {
        setImg(
          'https://res.cloudinary.com/awko-sock-co/image/upload/c_scale,w_2000/v1515266726/sock-header_jgttkl.jpg'
        )
      }}
      value={img}
    />
  )
}

storiesOf('Fileupload', module).add('Default', () => <FileUploader />)
