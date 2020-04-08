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

import React from "react"
import styled from "styled-components"
import { Button as TinaButton } from "@tinacms/styles"
import { EditIcon } from "@tinacms/icons"
import { useInlineForm } from "react-tinacms-inline"

export const EditToggle = styled(({ ...styleProps }) => {
  const { status, deactivate, activate } = useInlineForm()
  return (
    <TinaButton
      onClick={() => {
        status === "active" ? deactivate() : activate()
      }}
      primary
      {...styleProps}
    >
      {status === "active" ? "Preview" : "Edit"}
    </TinaButton>
  )
})`
  position: fixed;
  bottom: 46px;
  margin-left: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 128px;
  font-family: "Inter", sans-serif;
  z-index: 10;
`
