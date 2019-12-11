import React from "react"
import {
  Button as TinaButton,
  GlobalStyles as TinaGlobalStyles,
} from "@tinacms/styles"
import styled from "styled-components"

export const EditToggle = styled(
  ({ isEditing, setIsEditing, ...styleProps }) => {
    return (
      <TinaButton onClick={() => setIsEditing(p => !p)} primary {...styleProps}>
        {isEditing ? "Stop Editing" : "Start Editing"}
      </TinaButton>
    )
  }
)`
  position: fixed;
  bottom: 2.875rem;
  margin-left: 4rem;
`
