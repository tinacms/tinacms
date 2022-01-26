/**

Copyright 2021 Forestry.io Holdings, Inc.

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
import styled from 'styled-components'
import { useDropzone } from 'react-dropzone'

interface DropzoneProps {
  className?: string
  onClick(): void
  onDrop(acceptedFiles: any[]): void
  children: React.ReactNode
}

export function DropzoneWrapper({
  onDrop,
  onClick,
  className,
  children,
}: DropzoneProps) {
  // TODO: this accept should come from cms.media.store.accept. (This DropzoneWrapper is only being used for inline so it is not a priority)
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    onDrop,
    noClick: !!onClick,
  })

  return (
    <Container {...getRootProps()} onClick={onClick} className={className}>
      <input {...getInputProps()} />
      {children}
    </Container>
  )
}

export const Container = styled.div`
  width: inherit;
  height: inherit;
`
