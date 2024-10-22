import React from 'react'
import { Input } from '@toolkit/fields'
import {
  Modal,
  ModalHeader,
  ModalBody,
  PopupModal,
  ModalActions,
} from '@toolkit/react-modals'
import { Button } from '@toolkit/styles'
import { LoadingDots } from '@tinacms/toolkit'

interface DeleteModalProps {
  close(): void
  deleteFunc(): Promise<void>
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
  const [processing, setProcessing] = React.useState(false)
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
          <Button style={{ flexGrow: 2 }} disabled={processing} onClick={close}>
            Cancel
          </Button>
          <Button
            style={{ flexGrow: 3 }}
            disabled={processing}
            variant="danger"
            onClick={async () => {
              setProcessing(true)
              try {
                await deleteFunc()
              } catch (e) {
                console.error(e)
              } finally {
                close()
              }
            }}
          >
            <span className="mr-1">Delete</span>
            {processing && <LoadingDots />}
          </Button>
        </ModalActions>
      </PopupModal>
    </Modal>
  )
}

export const NewFolderModal = ({ onSubmit, close }: NewFolderModalProps) => {
  const [folderName, setFolderName] = React.useState('')
  return (
    <Modal>
      <PopupModal>
        <ModalHeader close={close}>New Folder</ModalHeader>
        <ModalBody padded={true}>
          <p className="text-base text-gray-700 mb-2">
            Please provide a name for your folder.
          </p>
          <p className="text-sm text-gray-500 mb-4 italic">
            <span className="font-bold">Note</span> &ndash; If you navigate away
            before uploading a media item, the folder will disappear.
          </p>
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
