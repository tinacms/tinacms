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
import styled from 'styled-components'
import { Button, color } from '@tinacms/styles'
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalActions,
} from './modals/ModalProvider'
import { CloseIcon } from '@tinacms/icons'
import { ModalPopup } from './modals/ModalPopup'

interface ResetFormProps {
  pristine: boolean
  reset(): void
}

export const ResetForm = ({ pristine, reset }: ResetFormProps) => {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <ResetButton
        onClick={() => {
          setOpen(p => !p)
        }}
        disabled={pristine}
      >
        Reset
      </ResetButton>
      {open && <ResetModal reset={reset} close={() => setOpen(false)} />}
    </>
  )
}

interface ResetModalProps {
  close(): void
  reset(): void
}

const ResetModal = ({ close, reset }: ResetModalProps) => {
  return (
    <Modal>
      <ModalPopup>
        <ModalHeader>
          Reset
          <CloseButton onClick={close}>
            <CloseIcon />
          </CloseButton>
        </ModalHeader>
        <ModalBody padded={true}>
          <p>Are you sure you want to reset all changes?</p>
        </ModalBody>
        <ModalActions>
          <Button onClick={close}>Cancel</Button>
          <Button
            margin
            primary
            onClick={async () => {
              await reset()
              close()
            }}
          >
            Reset
          </Button>
        </ModalActions>
      </ModalPopup>
    </Modal>
  )
}

const ResetButton = styled(Button)`
  flex: 0 0 6rem;
`

const CloseButton = styled.div`
  display: flex;
  align-items: center;
  fill: ${color.grey(3)};
  cursor: pointer;
  transition: fill 85ms ease-out;
  svg {
    width: 1.5rem;
    height: auto;
  }
  &:hover {
    fill: ${color.grey(8)};
  }
`
