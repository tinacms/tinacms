import React from 'react'
import { Input } from '../../packages/fields'
import {
  Modal,
  ModalHeader,
  ModalBody,
  PopupModal,
  ModalActions,
} from '../../packages/react-modals'
import { Button } from '../../packages/styles'

interface DeleteModalProps {
  close(): void
  deleteFunc(): void
  filename: string
}
interface NewFolderModalProps {
  onSubmit(filename: string): void
  close(): void
}

export const DeleteModal = ({
  close,
  deleteFunc,
  filename,
}: DeleteModalProps) => {
  return (
    <Modal>
      <PopupModal>
        <ModalHeader close={close}>Delete {filename}</ModalHeader>
        <ModalBody padded={true}>
          <p>
            Are you sure you want to delete <strong>{filename}</strong>?
          </p>
        </ModalBody>
        <ModalActions>
          <Button style={{ flexGrow: 2 }} onClick={close}>
            Cancel
          </Button>
          <Button
            style={{ flexGrow: 3 }}
            variant="danger"
            onClick={() => {
              deleteFunc()
              close()
            }}
          >
            Delete
          </Button>
        </ModalActions>
      </PopupModal>
    </Modal>
  )
}

// TODO: Scott B can you style this?
// It might not need styling but feel free to take a look
export const NewFolderModal = ({ onSubmit, close }: NewFolderModalProps) => {
  const [folderName, setFolderName] = React.useState('')
  return (
    <Modal>
      <PopupModal>
        <ModalHeader close={close}>New Folder</ModalHeader>
        <ModalBody padded={true}>
          <Input
            value={folderName}
            placeholder="Folder Name"
            required
            onChange={(e) => setFolderName(e.target.value)}
          />
        </ModalBody>
        <ModalActions>
          <Button style={{ flexGrow: 2 }} onClick={close}>
            Cancel
          </Button>
          <Button
            disabled={!folderName}
            style={{ flexGrow: 3 }}
            variant="primary"
            onClick={() => {
              if (!folderName) return
              onSubmit(folderName)
              close()
            }}
          >
            Create New Folder
          </Button>
        </ModalActions>
      </PopupModal>
    </Modal>
  )
}

export const SyncModal = ({ close, syncFunc, folder, branch }) => {
  return (
    <Modal>
      <PopupModal>
        <ModalHeader close={close}>Sync Media</ModalHeader>
        <ModalBody padded={true}>
          <p>
            {`This will copy media assets from the \`${folder}\` folder on branch \`${branch}\` in your git repository to Tina Cloud's asset service. This will allow you to use these assets in your site with Tina Cloud`}
          </p>
        </ModalBody>
        <ModalActions>
          <Button style={{ flexGrow: 2 }} onClick={close}>
            Cancel
          </Button>
          <Button
            style={{ flexGrow: 3 }}
            variant="primary"
            onClick={async () => {
              await syncFunc()
              close()
            }}
          >
            Sync Media
          </Button>
        </ModalActions>
      </PopupModal>
    </Modal>
  )
}
