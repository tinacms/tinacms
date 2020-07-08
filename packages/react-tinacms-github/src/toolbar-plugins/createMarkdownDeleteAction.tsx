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
import {
  ActionButton,
  useCMS,
  Form,
  Modal,
  ModalPopup,
  ModalHeader,
  ModalBody,
  ModalActions,
} from 'tinacms'
import { Button } from '@tinacms/styles'

const getTitleDefault = (form: Form) => {
  return form.name
}

interface options {
  getTitle?: (form: Form) => string
  getFilePath?: (form: Form) => string
}

export const createMarkdownDeleteAction = (
  { getTitle = getTitleDefault, getFilePath = getTitleDefault }: options = {
    getTitle: getTitleDefault,
    getFilePath: getTitleDefault,
  }
) => {
  const DeleteAction = ({ form }: { form: Form }) => {
    const cms = useCMS()
    const [active, setActive] = React.useState(false)
    const open = () => setActive(true)
    const close = () => setActive(false)
    const title = getTitle!(form)
    const filePath = getFilePath!(form)

    return (
      <div>
        <ActionButton onClick={open}>{`Delete ${title}`}</ActionButton>
        {active && (
          <Modal>
            <ModalPopup>
              <ModalHeader close={close}>{`Delete ${title}`} </ModalHeader>
              <ModalBody>
                {`Are you sure you want to delete ${title}`}
              </ModalBody>
              <ModalActions>
                <Button
                  onClick={async () => {
                    try {
                      close()
                      await cms.api.github.delete!(filePath)
                      await cms.alerts.info(`${filePath} was deleted`)
                    } catch (error) {
                      close()
                      cms.alerts.error(`Error in deleting ${filePath}`)
                      console.error(error)
                    } finally {
                      window.history.back()
                    }
                  }}
                >
                  Yes
                </Button>
                <Button onClick={close}>No</Button>
              </ModalActions>
            </ModalPopup>
          </Modal>
        )}
      </div>
    )
  }

  return DeleteAction
}
