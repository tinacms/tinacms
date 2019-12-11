import React from "react"
import styled from "styled-components"
import {
  Button as TinaButton,
  TinaResetStyles as TinaStyles,
} from "@tinacms/styles"
import { EditIcon } from "@tinacms/icons"

export const EditToggle = styled(
  ({ isEditing, setIsEditing, ...styleProps }) => {
    return (
      <TinaButton onClick={() => setIsEditing(p => !p)} primary {...styleProps}>
        <EditIcon /> {isEditing ? "Preview" : "Edit"}
      </TinaButton>
    )
  }
)`
  position: fixed;
  bottom: 2.875rem;
  margin-left: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 8rem;
  font-family: "Inter", sans-serif;
`
