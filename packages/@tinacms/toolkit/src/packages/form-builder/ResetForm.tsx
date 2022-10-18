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
import { FC } from 'react'
import { Button } from '../styles'
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalActions,
  ModalPopup,
} from '../react-modals'

interface ResetFormProps {
  children: any
  pristine: boolean
  reset(): void
  style?: React.CSSProperties
}

export const ResetForm: FC<ResetFormProps> = ({
  pristine,
  reset,
  children,
  ...props
}: ResetFormProps) => {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button
        onClick={() => {
          setOpen((p) => !p)
        }}
        disabled={pristine}
        {...props}
      >
        {children}
      </Button>
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
        <ModalHeader close={close}>Reset</ModalHeader>
        <ModalBody padded={true}>
          <p>Are you sure you want to reset all changes?</p>
        </ModalBody>
        <ModalActions>
          <Button style={{ flexGrow: 2 }} onClick={close}>
            Cancel
          </Button>
          <Button
            style={{ flexGrow: 3 }}
            variant="primary"
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
