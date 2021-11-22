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
import {
  Modal,
  PopupModal,
  ModalHeader,
  ModalBody,
  ModalActions,
  FieldsGroup,
} from 'tinacms'
import { Button } from '@tinacms/styles'

export function TinaModal({
  title = 'Save Changes',
  close = () => {},
  data = {},
}) {
  function handleClose(event) {
    event.stopPropagation()
    event.preventDefault()
    close()
  }

  return (
    <Modal id="tina-modal" onClick={(e) => e.stopPropagation()}>
      <PopupModal>
        <ModalHeader close={close}>{title}</ModalHeader>
        <ModalBody>
          <FieldsGroup>
            <div>
              <h3 className="font-bold text-xl mb-3">
                You control what happens with your data.
              </h3>
              <p className="whitespace-normal mb-3">
                Currently there are packages to support Git workflows, but Tina
                is designed to potentially work with any data source.
              </p>
              <details className="mb-4 px-2 pt-2 bg-gray-200 border border-gray-300 rounded">
                <summary className="list-none display-block cursor-pointer text-blue-500 hover:text-blue-700 mb-2 outline-none select-none">
                  View Raw JSON
                </summary>
                <pre className="mb-2 text-sm overflow-scroll">
                  <code className="leading-none">
                    {JSON.stringify(data, null, 2)}
                  </code>
                </pre>
              </details>
            </div>
          </FieldsGroup>
        </ModalBody>
        <ModalActions>
          <Button
            primary
            onClick={() => {
              window.location = 'https://tina.io/docs/getting-started/backends/'
            }}
          >
            <span className="whitespace-nowrap inline-block">
              Read The Docs
            </span>
          </Button>
          <Button onClick={handleClose}>Close</Button>
        </ModalActions>
      </PopupModal>
    </Modal>
  )
}
