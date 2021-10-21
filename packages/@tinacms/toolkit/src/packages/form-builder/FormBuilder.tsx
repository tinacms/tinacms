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
import styled, { keyframes } from 'styled-components'
import { FC } from 'react'
import { Form } from '../forms'
import { Form as FinalForm } from 'react-final-form'

import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import { Button } from '../styles'
import { ModalProvider } from '../react-modals'
import { LoadingDots } from './LoadingDots'
import { FormPortalProvider } from './FormPortal'
import { FieldsBuilder } from './fields-builder'
import { ResetForm } from './ResetForm'
import { FormActionMenu } from './FormActions'

export interface FormBuilderProps {
  form: Form
  label?: string
}

const NoFieldsPlaceholder = () => (
  <EmptyState>
    <Emoji>🤔</Emoji>
    <h3>Hey, you don't have any fields added to this form.</h3>
    <p>
      <LinkButton href="https://tinacms.org/docs/fields" target="_blank">
        <Emoji>📖</Emoji> Field Setup Guide
      </LinkButton>
    </p>
  </EmptyState>
)

export const SidebarFormBuilder: FC<FormBuilderProps> = ({
  form: tinaForm,
}) => {
  /**
   * > Why is a `key` being set when this isn't an array?
   *
   * `FinalForm` does not update when given a new `form` prop.
   *
   * We can force `FinalForm` to update by setting the `key` to
   * the name of the form. When the name changes React will
   * treat it as a new instance of `FinalForm`, destroying the
   * old `FinalForm` componentt and create a new one.
   *
   * See: https://github.com/final-form/react-final-form/blob/master/src/ReactFinalForm.js#L68-L72
   */
  const [i, setI] = React.useState(0)
  React.useEffect(() => {
    setI((i) => i + 1)
  }, [tinaForm])

  const finalForm = tinaForm.finalForm

  const moveArrayItem = React.useCallback(
    (result: DropResult) => {
      if (!result.destination || !finalForm) return
      const name = result.type
      finalForm.mutators.move(
        name,
        result.source.index,
        result.destination.index
      )
    },
    [tinaForm]
  )

  return (
    <ModalProvider>
      <FinalForm
        form={finalForm}
        key={`${i}: ${tinaForm.id}`}
        onSubmit={tinaForm.onSubmit}
      >
        {({ handleSubmit, pristine, invalid, submitting }) => {
          return (
            <DragDropContext onDragEnd={moveArrayItem}>
              <SidebarFormBody className="form-body">
                <FormPortalProvider>
                  {tinaForm && tinaForm.fields.length ? (
                    <FieldsBuilder form={tinaForm} fields={tinaForm.fields} />
                  ) : (
                    <NoFieldsPlaceholder />
                  )}
                </FormPortalProvider>
              </SidebarFormBody>
              <FormFooter className="form-footer">
                {tinaForm.reset && (
                  <ResetForm
                    pristine={pristine}
                    reset={async () => {
                      finalForm.reset()
                      await tinaForm.reset!()
                    }}
                  >
                    {tinaForm.buttons.reset}
                  </ResetForm>
                )}
                <Button
                  onClick={() => handleSubmit()}
                  disabled={pristine || submitting || invalid}
                  busy={submitting}
                  primary
                  grow
                  margin
                >
                  {submitting && <LoadingDots />}
                  {!submitting && tinaForm.buttons.save}
                </Button>
                {tinaForm.actions.length > 0 && (
                  <FormActionMenu
                    form={tinaForm as any}
                    actions={tinaForm.actions}
                  />
                )}
              </FormFooter>
            </DragDropContext>
          )
        }}
      </FinalForm>
    </ModalProvider>
  )
}

export const FormBuilder: FC<FormBuilderProps> = ({
  form: tinaForm,
  label,
}) => {
  /**
   * > Why is a `key` being set when this isn't an array?
   *
   * `FinalForm` does not update when given a new `form` prop.
   *
   * We can force `FinalForm` to update by setting the `key` to
   * the name of the form. When the name changes React will
   * treat it as a new instance of `FinalForm`, destroying the
   * old `FinalForm` componentt and create a new one.
   *
   * See: https://github.com/final-form/react-final-form/blob/master/src/ReactFinalForm.js#L68-L72
   */
  const [i, setI] = React.useState(0)
  React.useEffect(() => {
    setI((i) => i + 1)
  }, [tinaForm])

  const finalForm = tinaForm.finalForm

  const moveArrayItem = React.useCallback(
    (result: DropResult) => {
      if (!result.destination || !finalForm) return
      const name = result.type
      finalForm.mutators.move(
        name,
        result.source.index,
        result.destination.index
      )
    },
    [tinaForm]
  )

  return (
    <ModalProvider>
      <FinalForm
        form={finalForm}
        key={`${i}: ${tinaForm.id}`}
        onSubmit={tinaForm.onSubmit}
      >
        {({ handleSubmit, pristine, invalid, submitting }) => {
          return (
            <DragDropContext onDragEnd={moveArrayItem}>
              <div className="w-full h-screen flex flex-col items-center">
                <div className="px-6 py-4 w-full bg-white border-b border-gray-150 shadow-sm sticky flex flex-wrap gap-x-6 gap-y-3 justify-between items-center">
                  {label && (
                    <h4 className="font-bold text-lg opacity-80">{label}</h4>
                  )}
                  <div className="flex flex-1 items-center justify-end">
                    <FormStatus pristine={pristine} />
                    {tinaForm.reset && (
                      <ResetForm
                        pristine={pristine}
                        reset={async () => {
                          finalForm.reset()
                          await tinaForm.reset!()
                        }}
                      >
                        {tinaForm.buttons.reset}
                      </ResetForm>
                    )}
                    <Button
                      onClick={() => handleSubmit()}
                      disabled={pristine || submitting || invalid}
                      busy={submitting}
                      primary
                      margin
                    >
                      {submitting && <LoadingDots />}
                      {!submitting && tinaForm.buttons.save}
                    </Button>
                    {tinaForm.actions.length > 0 && (
                      <FormActionMenu
                        form={tinaForm as any}
                        actions={tinaForm.actions}
                      />
                    )}
                  </div>
                </div>
                <FormPortalProvider>
                  <FormWrapper padded={true}>
                    {tinaForm && tinaForm.fields.length ? (
                      <FieldsBuilder
                        form={tinaForm}
                        fields={tinaForm.fields}
                        padding={false}
                      />
                    ) : (
                      <NoFieldsPlaceholder />
                    )}
                  </FormWrapper>
                </FormPortalProvider>
              </div>
            </DragDropContext>
          )
        }}
      </FinalForm>
    </ModalProvider>
  )
}

const FormStatus = ({ pristine }) => {
  return (
    <div className="mr-6 flex flex-0 items-center">
      {!pristine && (
        <>
          <span className="w-3 h-3 flex-0 rounded-full bg-yellow-400 border border-yellow-500 mr-2"></span>{' '}
          <p className="text-gray-700 text-sm leading-tight whitespace-nowrap">
            Unsaved Changes
          </p>
        </>
      )}
      {pristine && (
        <>
          <span className="w-3 h-3 flex-0 rounded-full bg-green-300 border border-green-400 mr-2"></span>{' '}
          <p className="text-gray-500 text-sm leading-tight whitespace-nowrap">
            No Changes
          </p>
        </>
      )}
    </div>
  )
}

export const FormWrapper = ({ children, padded = false }) => {
  return (
    <div className="max-h-full overflow-y-auto h-full">
      <div className={`w-full flex justify-center ${padded && `px-6 pt-8`}`}>
        <div className={`max-w-screen-md w-full ${padded && `mb-0`}`}>
          {children}
        </div>
      </div>
    </div>
  )
}

const SidebarFormBody = styled.div`
  position: relative;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: auto;
  border-top: 1px solid var(--tina-color-grey-2);
  background-color: #f6f6f9;
`
const FormFooter = styled.div`
  position: relative;
  flex: 0 0 auto;
  width: 100%;
  height: 64px;
  background-color: white;
  border-top: 1px solid var(--tina-color-grey-2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
`
const Emoji = styled.span`
  font-size: 40px;
  line-height: 1;
  display: inline-block;
`

const EmptyStateAnimation = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`

const EmptyState = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--tina-padding-big) var(--tina-padding-big) 64px
    var(--tina-padding-big);
  width: 100%;
  height: 100%;
  overflow-y: auto;
  animation-name: ${EmptyStateAnimation};
  animation-delay: 300ms;
  animation-timing-function: ease-out;
  animation-iteration-count: 1;
  animation-fill-mode: both;
  animation-duration: 150ms;
  > *:first-child {
    margin: 0 0 var(--tina-padding-big) 0;
  }
  > ${Emoji} {
    display: block;
  }
  h3 {
    font-size: var(--tina-font-size-5);
    font-weight: normal;
    color: inherit;
    display: block;
    margin: 0 0 var(--tina-padding-big) 0;
    ${Emoji} {
      font-size: 1em;
    }
  }
  p {
    display: block;
    margin: 0 0 var(--tina-padding-big) 0;
  }
`

const LinkButton = styled.a`
  text-align: center;
  border: 0;
  border-radius: var(--tina-radius-big);
  border: 1px solid var(--tina-color-grey-2);
  box-shadow: var(--tina-shadow-small);
  font-weight: var(--tina-font-weight-regular);
  cursor: pointer;
  font-size: var(--tina-font-size-0);
  transition: all var(--tina-timing-short) ease-out;
  background-color: white;
  color: var(--tina-color-grey-8);
  padding: var(--tina-padding-small) var(--tina-padding-big)
    var(--tina-padding-small) 56px;
  position: relative;
  text-decoration: none;
  display: inline-block;
  ${Emoji} {
    font-size: 24px;
    position: absolute;
    left: var(--tina-padding-big);
    top: 50%;
    transform-origin: 50% 50%;
    transform: translate3d(0, -50%, 0);
    transition: all var(--tina-timing-short) ease-out;
  }
  &:hover {
    color: var(--tina-color-primary);
    ${Emoji} {
      transform: translate3d(0, -50%, 0);
    }
  }
`
