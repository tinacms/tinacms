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
import { getHeadBranch } from '../../open-authoring/repository'
import { AsyncButton } from '../../open-authoring-ui/components/AsyncButton'

const BASE_BRANCH = process.env.BASE_BRANCH

interface Props {
  baseRepoFullName: string
  forkRepoFullName: string
}

export const PRModal = ({ forkRepoFullName, baseRepoFullName }: Props) => {
  const [prError, setPrError] = useState('')
  const [fetchedPR, setFetchedPR] = useState<any>(undefined)
  const cms = useCMS()

  const titleInput = React.createRef() as any
  const bodyInput = React.createRef() as any

  const checkForPR = async () => {
    await cms.api.github
      .fetchExistingPR(forkRepoFullName, getHeadBranch())
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
    return cms.api.github
      .createPR(
        forkRepoFullName,
        getHeadBranch(),
        titleInput.current.value,
        bodyInput.current.value
      )
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

  return (
    <>
      <PrModalBody>
        {!fetchedPR.id && (
          <>
            <ModalDescription>
              Create a pull request from{' '}
              <b>
                {forkRepoFullName} - {getHeadBranch()}
              </b>{' '}
              into{' '}
              <b>
                {baseRepoFullName} - {BASE_BRANCH}
              </b>
              .{' '}
              <a
                target="_blank"
                href={`https://github.com/${baseRepoFullName}/compare/${BASE_BRANCH}...${
                  forkRepoFullName.split('/')[0]
                }:${getHeadBranch()}`}
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
            You've created a pull request from{' '}
            <b>
              {forkRepoFullName} - {getHeadBranch()}
            </b>{' '}
            into{' '}
            <b>
              {baseRepoFullName} - {BASE_BRANCH}
            </b>
            .
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
              href={`https://github.com/${baseRepoFullName}/compare/${BASE_BRANCH}...${
                forkRepoFullName.split('/')[0]
              }:${getHeadBranch()}`}
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
