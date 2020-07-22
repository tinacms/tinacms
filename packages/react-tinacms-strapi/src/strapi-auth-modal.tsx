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
import { STRAPI_JWT, TinaStrapiClient } from './tina-strapi-client'

import { Button } from '@tinacms/styles'
import Cookies from 'js-cookie'
import { Input } from '@tinacms/fields'
import popupWindow from './popupWindow'
import styled from 'styled-components'

export interface StrapiAuthenticationModalProps {
  onAuthSuccess(): void
  close(): void
}

export function StrapiAuthenticationModal({
  onAuthSuccess,
  close,
}: StrapiAuthenticationModalProps) {
  const cms = useCMS()
  const [error, setError] = useState<string | undefined>()
  const strapi: TinaStrapiClient = cms.api.strapi

  return (
    <ModalBuilder
      title="Strapi Authentication"
      message="Login with your Strapi account."
      close={close}
      actions={[]}
    >
      <StrapiLoginForm
        close={close}
        onAuthSuccess={onAuthSuccess}
        error={error}
        onSubmit={async (values: LoginFormFieldProps) => {
          strapi
            .authenticate(values.username, values.password)
            .then(async (response: Response) => {
              if (response.status != 200) {
                cms.events.dispatch({ type: 'strapi:error' })
                const responseJson = await response.json()

                setError(
                  `Login failed: ${responseJson.data[0].messages[0].message}`
                )
              } else {
                const responseJson = await response.json()
                Cookies.set(STRAPI_JWT, responseJson.jwt)
                onAuthSuccess()
              }
            })
            .catch((e: Error) => {
              cms.events.dispatch({ type: 'strapi:error', error: e })
            })
        }}
      />
      {/* Providers can be added to this modal by adding buttons that make a call such as
      `startProviderAuth({ provider: "github", onAuthSuccess })`
      */}
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

interface LoginFormFieldProps {
  username: string
  password: string
}

interface LoginFormProps {
  onSubmit(values: LoginFormFieldProps): void
  close(): void
  onAuthSuccess(): void
  error: string | undefined
}

export function StrapiLoginForm({ onSubmit, close, error }: LoginFormProps) {
  return (
    <FormWrapper>
      <strong>{error}</strong>
      <Form
        onSubmit={onSubmit}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Field
              name="username"
              render={({ input }) => (
                <InputWrapper>
                  <label>
                    <p>Username</p>
                    <Input {...input} />
                  </label>
                </InputWrapper>
              )}
            ></Field>
            <Field
              name="password"
              render={({ input }) => (
                <InputWrapper>
                  <label>
                    <p>Password</p>
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

interface ProviderAuthProps {
  provider: string
  onAuthSuccess(): void
}

export function startProviderAuth({
  provider,
  onAuthSuccess,
}: ProviderAuthProps) {
  let authTab: Window | undefined
  const previousCookie = Cookies.get(STRAPI_JWT)

  // poll the cookie value for a change. close the auth window on change
  // there are no native JS events that support this behaviour
  const cookiePollInterval = window.setInterval(() => {
    const currentCookie = Cookies.get(STRAPI_JWT)
    if (currentCookie && currentCookie != previousCookie) {
      if (authTab) authTab.close()
      onAuthSuccess()
      clearInterval(cookiePollInterval)
    }
  }, 1000)

  authTab = popupWindow(
    `${process.env.STRAPI_URL}/connect/${provider}`,
    '_blank',
    window,
    1000,
    700
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
