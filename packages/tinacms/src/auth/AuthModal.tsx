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

import {
  Modal,
  ModalPopup,
  ModalHeader,
  ModalBody,
  ModalActions,
} from '@tinacms/toolkit'
import { StyleReset, LoadingDots, Button } from '@tinacms/toolkit'
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

interface ModalBuilderProps {
  title: string
  message: string
  error?: string
  actions: any[]
  close(): void
}

export function ModalBuilder(modalProps: ModalBuilderProps) {
  return (
    <StyleReset>
      <Modal>
        <ModalPopup>
          <ModalHeader>{modalProps.title}</ModalHeader>
          <ModalBody padded>
            <p>{modalProps.message}</p>
            {modalProps.error && <ErrorLabel>{modalProps.error}</ErrorLabel>}
          </ModalBody>
          <ModalActions>
            {modalProps.actions.map((action: any) => (
              <AsyncButton {...action} />
            ))}
          </ModalActions>
        </ModalPopup>
      </Modal>
    </StyleReset>
  )
}

export const ErrorLabel = styled.p`
  color: var(--tina-color-error) !important;
`

interface ButtonProps {
  name: string
  action(): Promise<void>
  primary: boolean
}

export const AsyncButton = ({ name, primary, action }: ButtonProps) => {
  const [submitting, setSubmitting] = useState(false)

  const onClick = useCallback(async () => {
    setSubmitting(true)
    try {
      await action()
      setSubmitting(false)
    } catch (e) {
      setSubmitting(false)
      throw e
    }
  }, [action, setSubmitting])

  return (
    <Button
      primary={primary}
      onClick={onClick}
      busy={submitting}
      disabled={submitting}
    >
      {submitting && <LoadingDots />}
      {!submitting && name}
    </Button>
  )
}
