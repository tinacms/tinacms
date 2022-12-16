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
import { FC } from 'react'
import { Button } from '../styles'
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalActions,
  ModalPopup,
} from '../react-modals'
import { BaseTextField } from '../fields'
import { useBranchData } from '../../plugins/branch-switcher'

interface CreatePullRequestProps {
  title: string
  branch: string
  baseBranch: string
}

interface Client {
  createPullRequest: (
    props: CreatePullRequestProps
  ) => Promise<{ pullNumber: number }>
  indexStatus: ({ branch: string }) => Promise<{ status: string }>
  vercelStatus: ({
    pullNumber,
  }: {
    pullNumber: number
  }) => Promise<{ status: string; previewUrl?: string }>
}

interface PublishFormProps {
  children: any
  pristine: boolean
  isDefaultBranch: boolean
  submit(): void
  style?: React.CSSProperties
  client: Client
}

export const PublishForm: FC<PublishFormProps> = ({
  pristine,
  submit,
  children,
  isDefaultBranch,
  client,
  ...props
}: PublishFormProps) => {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button
        onClick={() => {
          if (isDefaultBranch) {
            setOpen((p) => !p)
          } else {
            submit()
          }
        }}
        disabled={pristine}
        {...props}
      >
        {children}
      </Button>
      {open && (
        <SubmitModal
          previewCommit={() => {}}
          close={() => setOpen(false)}
          publishCommit={() => {
            submit()
          }}
          client={client}
        />
      )}
    </>
  )
}

interface SubmitModalProps {
  close(): void
  previewCommit(): void
  publishCommit(): void
  client: Client
}

const SubmitModal = ({ close, publishCommit, client }: SubmitModalProps) => {
  const [modalState, setModalState] = React.useState<
    'initial' | 'setupPullRequest' | 'creatingPullRequest' | 'previewReady'
  >('initial')
  const [pullRequestTitle, setPullRequestTitle] = React.useState('')
  const branchName = pullRequestTitle.toLowerCase().replaceAll(' ', '-')
  const [previewUrl] = React.useState('')
  const { currentBranch, setCurrentBranch } = useBranchData()

  const handleCreatePullRequest = React.useCallback(async () => {
    setModalState('creatingPullRequest')
    await client
      .createPullRequest({
        title: pullRequestTitle,
        branch: branchName,
        baseBranch: currentBranch,
      })
      .then(async ({ pullNumber }) => {
        setCurrentBranch(branchName)

        window.localStorage.setItem(
          'tinacms-current-pull-number',
          pullNumber.toString()
        )
        // wait for index to be built
        while (true) {
          const { status } = await client.indexStatus({ branch: branchName })
          if (status === 'complete') {
            break
          }
          await new Promise((p) => setTimeout(p, 1000))
        }

        publishCommit()

        setModalState('previewReady')
      })
  }, [
    client,
    branchName,
    pullRequestTitle,
    currentBranch,
    setCurrentBranch,
    setModalState,
    publishCommit,
  ])

  return (
    <Modal>
      <ModalPopup>
        <ModalHeader close={close}>Save Changes</ModalHeader>
        <ModalBody padded={true}>
          {modalState === 'initial' && (
            <p>Are you sure you want to save to production?</p>
          )}
          {modalState === 'setupPullRequest' && (
            <div>
              {/* @ts-ignore PR FOR DEMO ONLY */}
              <BaseTextField
                placeholder="Description"
                value={pullRequestTitle}
                onChange={(e) => setPullRequestTitle(e.target.value)}
              />
              {/* @ts-ignore PR FOR DEMO ONLY */}
              <BaseTextField
                placeholder="Branch Name"
                value={branchName}
                readOnly
                disabled
              />
            </div>
          )}
          {modalState === 'creatingPullRequest' && (
            <p>Creating Pull Request...</p>
          )}
          {modalState === 'previewReady' && (
            <p>
              Preview Ready: <a href={previewUrl}>{previewUrl}</a>
            </p>
          )}
        </ModalBody>

        <ModalActions>
          {modalState === 'initial' && (
            <>
              <Button
                style={{ flexGrow: 2 }}
                onClick={() => setModalState('setupPullRequest')}
              >
                Save to Preview Environment
              </Button>
              <Button
                style={{ flexGrow: 3 }}
                variant="primary"
                onClick={async () => {
                  await publishCommit()
                  close()
                }}
              >
                Publish
              </Button>
            </>
          )}
          {(modalState === 'setupPullRequest' ||
            modalState === 'creatingPullRequest') && (
            <Button
              style={{ flexGrow: 2 }}
              onClick={() => handleCreatePullRequest()}
              disabled={
                branchName.length === 0 || modalState === 'creatingPullRequest'
              }
            >
              Create Preview
            </Button>
          )}
          {modalState === 'previewReady' && (
            <Button
              style={{ flexGrow: 2 }}
              onClick={() => {
                close()
              }}
            >
              Close
            </Button>
          )}
        </ModalActions>
      </ModalPopup>
    </Modal>
  )
}
