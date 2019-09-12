import * as React from 'react'
import styled from 'styled-components'
import { useCMS } from '@tinacms/react-tinacms'
import { TextField } from '@tinacms/fields'
import { SaveButton, CancelButton } from './FormView'
import { Modal, ModalHeader, ModalBody } from '../modalProvider'
import { ModalPopup } from '../modalPopup'
import { Button } from './Button'

export const CreateContentButton = ({ plugin }: any) => {
  let cms = useCMS()
  let [postName, setPostName] = React.useState('')
  let [open, setOpen] = React.useState(false)
  return (
    <div>
      <CreateButton onClick={() => setOpen(p => !p)}>
        {plugin.name}
      </CreateButton>
      {open && (
        <Modal>
          <ModalPopup>
            <ModalHeader>{plugin.name}</ModalHeader>
            <ModalBody>
              <TextField
                onChange={e => setPostName(e.target.value)}
                value={postName}
              />
            </ModalBody>
            <ModalActions>
              <SaveButton
                onClick={() => {
                  plugin.onSubmit(postName, cms)
                  setOpen(false)
                }}
              >
                Create
              </SaveButton>
              <CancelButton onClick={() => setOpen(p => !p)}>
                Cancel
              </CancelButton>
            </ModalActions>
          </ModalPopup>
        </Modal>
      )}
    </div>
  )
}

const CreateButton = styled(Button)`
  width: 100%;
`

const ModalActions = styled.div`
  display: flex;
  justify-content: space-between;
  border-radius: 0 0 ${p => p.theme.radius.big} ${p => p.theme.radius.big};
  overflow: hidden;
  ${Button} {
    border-radius: 0;
    flex: 1 0 auto;
  }
`
