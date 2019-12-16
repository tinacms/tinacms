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
