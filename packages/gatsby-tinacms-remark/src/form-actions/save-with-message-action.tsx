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
import { useState } from 'react'
import {
  ActionButton,
  useCMS,
  Form,
  Modal,
  ModalActions,
  ModalHeader,
  ModalBody,
} from 'tinacms'

export function SaveWithMessageAction({ form }: { form: Form }) {
  const cms = useCMS()
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('')
  return (
    <>
      <ActionButton
        onClick={() => {
          setVisible(true)
        }}
      >
        Save with Message
      </ActionButton>
      {visible && (
        <Modal>
          <ModalHeader close={close}>Save with Message</ModalHeader>
          <ModalBody>
            <textarea onChange={e => setMessage(e.target.value)} />
          </ModalBody>
          <ModalActions>
            <button
              onClick={() => {
                setVisible(false)
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                alert('MESSAGE: ' + message)
                return cms.api.git.onSubmit!({
                  files: [form.values.fileRelativePath],
                  message,
                })
              }}
              disabled={!message}
            >
              Save
            </button>
          </ModalActions>
        </Modal>
      )}
    </>
  )
}
