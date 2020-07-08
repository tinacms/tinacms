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

const getTitleTest = (form: Form) => {
  return form.name
}

interface options {
  getTitle: (form: Form) => string
  getFileName: (form: Form) => string
}

export const createDeleteAction = (
  { getTitle, getFileName }: options = {
    getTitle: getTitleTest,
    getFileName: getTitleTest,
  }
) => {
  const DeleteAction = ({ form }: { form: Form }) => {
    const cms = useCMS()
    const [active, setActive] = React.useState(false)
    const open = () => setActive(true)
    const close = () => setActive(false)
    const title = getTitle(form)
    const fileName = getFileName(form)

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
                      await cms.api.github.delete!(fileName)
                      await cms.alerts.info(`${fileName} was deleted`)
                    } catch (error) {
                      close()
                      cms.alerts.error(`Error in deleting ${fileName}`)
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
