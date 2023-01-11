import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalActions,
  ModalPopup,
} from '../../react-modals'
import React, { useState } from 'react'
import { Button } from '../../styles'
import FileDropper from './FileDropper'
import SchemaPreview from './SchemaPreview'

enum MODAL_STATE {
  HIDDEN,
  DROPZONE,
  SCHEMA_DETAILS,
}
export const AddCollection = () => {
  const [modalState, setModalState] = useState(MODAL_STATE.HIDDEN)
  const [markdownFile, setMarkdownFile] = useState<string>('')

  const close = () => {
    setModalState(MODAL_STATE.HIDDEN)
  }
  const open = () => {
    setModalState(MODAL_STATE.DROPZONE)
  }

  const addMarkdown = (markdownFile: string) => {
    setMarkdownFile(markdownFile)
    setModalState(MODAL_STATE.SCHEMA_DETAILS)
  }
  return (
    <>
      <div
        onClick={open}
        className="text-slate-500 hover:text-blue-600 mt-2 text-sm cursor-pointer"
      >
        Add New
      </div>
      {modalState !== MODAL_STATE.HIDDEN && (
        <Modal>
          <ModalPopup>
            <ModalHeader close={close}>Add New Collection</ModalHeader>
            <ModalBody padded={true}>
              {modalState === MODAL_STATE.DROPZONE && (
                <FileDropper setMarkdown={addMarkdown} />
              )}
              {modalState === MODAL_STATE.SCHEMA_DETAILS && (
                <>
                  <p>Enter some details about your collection</p>
                  <SchemaPreview markdownFile={markdownFile} />
                </>
              )}
            </ModalBody>

            <ModalActions>
              <Button
                style={{ flexGrow: 2 }}
                onClick={() => {
                  close()
                }}
              >
                Close
              </Button>
            </ModalActions>
          </ModalPopup>
        </Modal>
      )}
    </>
  )
}
