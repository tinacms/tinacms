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

import { Button as RawTinaButton } from '@tinacms/styles'
import { Input, TextArea } from '@tinacms/fields'
import { ModalBody, ModalActions, FieldMeta, useCMS } from 'tinacms'
import styled from 'styled-components'
import React, { useEffect, useState } from 'react'
import { AsyncButton } from '../../components/AsyncButton'
import { GithubClient } from '../../github-client'

export const PRModal = () => {
  const [prError, setPrError] = useState('')
  const [fetchedPR, setFetchedPR] = useState<any>(undefined)
  const cms = useCMS()
  const github: GithubClient = cms.api.github

  const titleInput = React.createRef() as any
  const bodyInput = React.createRef() as any

  const checkForPR = async () => {
    await github
      .fetchExistingPR()
      .then((pull: any) => {
        if (pull) {
          setFetchedPR(pull)
        } else {
          setFetchedPR({ id: null })
        }
      })
      .catch(() => {
        setPrError(`Could not fetch Pull Requests`)
      })
  }

  const createPR = () => {
    return github
      .createPR(titleInput.current.value, bodyInput.current.value)
      .then(() => {
        checkForPR() // TODO - can we use PR from response instead of refetching?
      })
      .catch(() => {
        setPrError(`Pull Request failed, are you sure you have any changes?`)
      })
  }

  useEffect(() => {
    checkForPR()
  }, [])

  if (prError) {
    return (
      <PrModalBody>
        <ModalDescription>
          <p>{prError}</p>
        </ModalDescription>
      </PrModalBody>
    )
  }

  if (!fetchedPR) {
    return (
      <PrModalBody>
        <ModalDescription>
          <p>Loading...</p>
        </ModalDescription>
      </PrModalBody>
    )
  }

  let workingBranch = github.branchName
  let baseBranch = github.baseBranch

  if (github.isFork) {
    const username = github.workingRepoFullName.split('/')[0]
    const baseOwner = github.baseRepoFullName.split('/')[0]
    workingBranch = `${username}:${workingBranch}`
    baseBranch = `${baseOwner}:${baseBranch}`
  }

  if (workingBranch === baseBranch) {
    return (
      <PrModalBody>
        <ModalDescription>
          <p>
            You are currently on the base branch: <b>{baseBranch}</b>.
          </p>
          <p>To create a Pull Request you must first switch to a new branch.</p>
        </ModalDescription>
      </PrModalBody>
    )
  }

  return (
    <>
      <PrModalBody>
        {!fetchedPR.id && (
          <>
            <ModalDescription>
              Create a pull request from <b>{workingBranch}</b> into{' '}
              <b>{baseBranch}</b>.{' '}
              <a
                target="_blank"
                href={`https://github.com/${github.baseRepoFullName}/compare/${
                  github.baseBranch
                }...${github.workingRepoFullName.split('/')[0]}:${
                  github.branchName
                }`}
              >
                View changes on GitHub
              </a>
              .
            </ModalDescription>
            <FieldMeta label="PR Title" name="title">
              <Input type="text" ref={titleInput} />
            </FieldMeta>
            <FieldMeta label="PR Description" name="description">
              <TextArea ref={bodyInput} />
            </FieldMeta>
          </>
        )}
        {fetchedPR.id && (
          <ModalDescription>
            You've created a pull request from <b>{workingBranch}</b> into{' '}
            <b>{baseBranch}</b>.
          </ModalDescription>
        )}
      </PrModalBody>
      <ModalActions>
        {!fetchedPR.id && (
          <AsyncButton primary name="Create Pull Request" action={createPR} />
        )}
        {fetchedPR && fetchedPR.html_url && (
          <>
            <TinaButton
              as="a"
              // @ts-ignore
              href={`https://github.com/${github.baseRepoFullName}/compare/${
                github.baseBranch
              }...${github.workingRepoFullName.split('/')[0]}:${
                github.branchName
              }`}
              target="_blank"
            >
              View Diff
            </TinaButton>
            <TinaButton
              as="a"
              primary
              // @ts-ignore
              href={fetchedPR.html_url}
              target="_blank"
            >
              View Pull Request
            </TinaButton>
          </>
        )}
      </ModalActions>
    </>
  )
}

const TinaButton = styled(RawTinaButton)`
  height: auto;
  padding-top: 0.8125rem;
  padding-bottom: 0.8125rem;
  text-decoration: none;
  line-height: 1;
`

const ModalDescription = styled.p`
  margin-bottom: 1rem;

  b {
    font-weight: bold;
  }
`

const PrModalBody = styled(ModalBody)`
  padding: 1.25rem 1.25rem 0 1.25rem;
`
