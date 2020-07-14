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
  Modal,
  ModalPopup,
  ModalHeader,
  ModalBody,
  ModalActions,
} from '@tinacms/react-modals'
import { ActionButton } from '@tinacms/react-forms'
import { useCMS } from '@tinacms/react-core'
import { Button } from '@tinacms/styles'
import { Form } from '@tinacms/forms'

const getTitleDefault = (form: Form) => {
  return form.name
}

interface options {
  getTitle?: (form: Form) => string
  getFilePath?: (form: Form) => string
}

/**
 * This function returns an action that can but used in a form to delete files in github.
 *
 * Options
 * getTitle: a function that takes in a form and returns a title of the file to be deleted (optional)
 * getFilePath: a function that takes in a form and returns a the file path in github (optional)
 *
 * EXAMPLE
 * const deleteAction = createGithubDeleteAction()
 *
 * const formOptions = {
 *    actions: [deleteAction, ...]
 *    //..
 * }
 * const [data, form] = useGithubJsonForm(file, formOptions);
 * usePlugin(form);
 *
 * NOTE: this will delete the entire file that is used to store the form data. The primary use case would be dynamic page content like blog posts.
 *
 */
export const createGithubDeleteAction = (
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
      <React.Fragment>
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
                    } catch (error) {
                      close()
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
      </React.Fragment>
    )
  }

  return DeleteAction
}
