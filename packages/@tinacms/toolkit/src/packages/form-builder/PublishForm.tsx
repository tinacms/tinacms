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

interface PublishFormProps {
  children: any
  pristine: boolean
  submit(): void
  style?: React.CSSProperties
}

export const PublishForm: FC<PublishFormProps> = ({
  pristine,
  submit,
  children,
  ...props
}: PublishFormProps) => {
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
      {open && (
        <SubmitModal
          previewCommit={() => {}}
          close={() => setOpen(false)}
          publishCommit={() => {
            submit()
          }}
        />
      )}
    </>
  )
}

interface SubmitModalProps {
  close(): void
  previewCommit(): void
  publishCommit(): void
}

const SubmitModal = ({
  close,
  previewCommit,
  publishCommit,
}: SubmitModalProps) => {
  return (
    <Modal>
      <ModalPopup>
        <ModalHeader close={close}>Save Changes</ModalHeader>
        <ModalBody padded={true}>
          <p>Are you sure you want to save to production?</p>
        </ModalBody>
        <ModalActions>
          <Button style={{ flexGrow: 2 }} onClick={previewCommit}>
            Save to Preview Environment
          </Button>
          <Button
            style={{ flexGrow: 3 }}
            variant="primary"
            onClick={async () => {
              await publishCommit()
              close()
            }}
          >
            Publish
          </Button>
        </ModalActions>
      </ModalPopup>
    </Modal>
  )
}
