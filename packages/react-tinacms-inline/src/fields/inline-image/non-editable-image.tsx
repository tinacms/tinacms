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
import { ImageRenderChildren } from './inline-image-field'
import { Container } from './inline-image-upload'

interface NonEditableImageProps {
  src?: string
  alt?: string
  className?: string
  children?: ImageRenderChildren
}

export function NonEditableImage({
  src,
  alt,
  className,
  children,
}: NonEditableImageProps) {
  return (
    <Container className={className}>
      {children ? children({ src }) : <img src={src} alt={alt} />}
    </Container>
  )
}
