import * as React from 'react'
import styled from 'styled-components'

// TODO: Copy from old app?

export const FileUpload = styled.div<{ error?: boolean }>`
  width: 100%;
  height: 80px;
  margin: 0;
  border-width: 1px;
  border-style: solid;
  border-color: ${p => (p.error ? 'red' : '#eaeaea')};
`
