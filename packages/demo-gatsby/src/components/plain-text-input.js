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

import React, { useEffect } from "react"
import styled from "styled-components"
import autosize from "autosize"

const PlainTextarea = styled.textarea`
  border: none;
  background: transparent;
  width: 100%;
  margin: 0;
  padding: 0;
  min-height: 0;
  max-height: none;
  resize: none;
  overflow: hidden;
  line-height: inherit;
  font-size: inherit;
  &:focus {
    outline: none;
  }
`

export const PlainTextInput = ({ input }) => {
  let textInput = React.createRef()
  useEffect(() => {
    autosize(textInput)
  }, [])
  return <PlainTextarea ref={c => (textInput = c)} {...input} rows="1" />
}
