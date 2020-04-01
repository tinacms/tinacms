import React, { useState } from 'react'
import { Modal, ModalPopup, ModalHeader, ModalBody } from 'tinacms'
import PrIconSvg from '../../ui/pr-icon.svg'
import { PRModal } from './PRModal'
import { DesktopLabel } from '../../ui/DesktopLabel'
import { ToolbarButton } from '../../ui/ToolbarButton'

interface PullRequestButtonOptions {
  baseRepoFullName: string
  forkRepoFullName: string
}

export const PRPlugin = (
  baseRepoFullName: string,
  forkRepoFullName: string
) => ({
  __type: 'toolbar:widget',
  name: 'create-pr',
  weight: 5,
  component: PullRequestButton,
  props: {
    baseRepoFullName,
    forkRepoFullName,
  },
})

function PullRequestButton({
  baseRepoFullName,
  forkRepoFullName,
}: PullRequestButtonOptions) {
  const [opened, setOpened] = useState(false)
  const close = () => setOpened(false)
  return (
    <>
      <ToolbarButton onClick={() => setOpened(p => !p)}>
        <PrIconSvg />
        <DesktopLabel> Pull Request</DesktopLabel>
      </ToolbarButton>
      {opened && (
        <Modal>
          <ModalPopup>
            <ModalHeader close={close}>Pull Request</ModalHeader>
            <ModalBody>
              <PRModal
                baseRepoFullName={baseRepoFullName}
                forkRepoFullName={forkRepoFullName}
              />
            </ModalBody>
          </ModalPopup>
        </Modal>
      )}
    </>
  )
}
