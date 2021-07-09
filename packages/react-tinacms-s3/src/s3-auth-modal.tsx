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

import { Field, Form } from 'react-final-form'
import { useCMS } from '@tinacms/react-core'
import {
  Modal,
  ModalActions,
  ModalBody,
  ModalHeader,
  ModalPopup,
} from '@tinacms/react-modals'
import React, { useState } from 'react'
import { S3StsClient } from './s3-sts-client'

import { Button } from '@tinacms/styles'
import { Input } from '@tinacms/fields'
import styled from 'styled-components'

export interface S3AuthModalProps {
  onAuthSuccess(): void
  close(): void
}

export function S3AuthModal({ onAuthSuccess, close }: S3AuthModalProps) {
  const cms = useCMS()
  const [error, setError] = useState<string | undefined>()
  const s3Sts: S3StsClient = cms.api.s3Sts

  return (
    <ModalBuilder
      title="AWS Access Key"
      message="Access S3 with your AWS credentials."
      close={close}
      actions={[]}
    >
      <S3AuthForm
        close={close}
        onAuthSuccess={onAuthSuccess}
        error={error}
        onSubmit={async (values: AuthFormFieldProps) => {
          try {
            await s3Sts.authenticate(values.accessKeyId, values.secretAccessKey)
            onAuthSuccess()
          } catch (error) {
            if (false) {
              // TODO: work out when we have a nice error we could show
              setError(`Login failed: ${error}`)
            } else {
              cms.events.dispatch({ type: 's3:error', error })
            }
          }
        }}
      />
    </ModalBuilder>
  )
}

interface ModalBuilderProps {
  title: string
  message: string
  actions: any[]
  close(): void
  children?: any
}

interface AuthFormFieldProps {
  accessKeyId: string
  secretAccessKey: string
}

interface AuthFormProps {
  onSubmit(values: AuthFormFieldProps): void
  close(): void
  onAuthSuccess(): void
  error: string | undefined
}

export function S3AuthForm({ onSubmit, close, error }: AuthFormProps) {
  return (
    <FormWrapper>
      <strong>{error}</strong>
      <Form
        onSubmit={onSubmit}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Field
              name="accessKeyId"
              render={({ input }) => (
                <InputWrapper>
                  <label>
                    <p>Access Key ID</p>
                    <Input {...input} />
                  </label>
                </InputWrapper>
              )}
            ></Field>
            <Field
              name="secretAccessKey"
              render={({ input }) => (
                <InputWrapper>
                  <label>
                    <p>Secret Access Key</p>
                    <Input type="password" {...input} />
                  </label>
                </InputWrapper>
              )}
            ></Field>
            <ModalActions>
              <Button type="button" onClick={close}>
                Close
              </Button>
              <Button primary type="submit">
                Submit
              </Button>
            </ModalActions>
          </form>
        )}
      ></Form>
    </FormWrapper>
  )
}

export function ModalBuilder(modalProps: ModalBuilderProps) {
  return (
    <Modal>
      <ModalPopup>
        <ModalHeader close={modalProps.close}>{modalProps.title}</ModalHeader>
        <ModalBody padded>
          <p>{modalProps.message}</p>
          {modalProps.children}
        </ModalBody>
      </ModalPopup>
    </Modal>
  )
}

const FormWrapper = styled.div`
  padding: 1rem;
  border-radius: 3rem;
`

const InputWrapper = styled.div`
  padding-bottom: 1rem;
`
