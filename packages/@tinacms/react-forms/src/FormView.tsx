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

import * as React from 'react'
import { FormBuilder, FieldsBuilder } from '@tinacms/form-builder'

import { Form } from '@tinacms/forms'
import styled, { keyframes, StyledComponent } from 'styled-components'
import { Button } from '@tinacms/styles'
import { FormActionMenu } from './FormActions'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import { LoadingDots } from './LoadingDots'
import { ResetForm } from './ResetForm'
import { useCMS } from '@tinacms/react-core'
import { FormPortalProvider } from './FormPortal'

export interface FormViewProps {
  activeForm: Form
}
export function FormView({ activeForm }: FormViewProps) {
  const cms = useCMS()
  //@ts-ignore
  const buttons = cms.sidebar?.buttons || activeForm.buttons
  const moveArrayItem = React.useCallback(
    (result: DropResult) => {
      if (!result.destination || !activeForm) return
      const name = result.type
      activeForm.mutators.move(
        name,
        result.source.index,
        result.destination.index
      )
    },
    [activeForm]
  )

  return (
    <FormBuilder form={activeForm as any}>
      {({ handleSubmit, pristine, form, submitting }) => {
        return (
          <DragDropContext onDragEnd={moveArrayItem}>
            <FormBody>
              <FormPortalProvider>
                <Wrapper>
                  {activeForm &&
                    (activeForm.fields.length ? (
                      <FieldsBuilder
                        form={activeForm}
                        fields={activeForm.fields}
                      />
                    ) : (
                      <NoFieldsPlaceholder />
                    ))}
                </Wrapper>
              </FormPortalProvider>
            </FormBody>
            <FormFooter>
              <Wrapper>
                {activeForm.reset && (
                  <ResetForm
                    pristine={pristine}
                    reset={async () => {
                      form.reset()
                      await activeForm.reset!()
                    }}
                  >
                    {buttons.reset}
                  </ResetForm>
                )}
                <Button
                  onClick={() => handleSubmit()}
                  disabled={pristine}
                  busy={submitting}
                  primary
                  grow
                  margin
                >
                  {submitting && <LoadingDots />}
                  {!submitting && buttons.save}
                </Button>
                {activeForm.actions.length > 0 && (
                  <FormActionMenu
                    actions={activeForm.actions}
                    form={activeForm}
                  />
                )}
              </Wrapper>
            </FormFooter>
          </DragDropContext>
        )
      }}
    </FormBuilder>
  )
}

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

export const Wrapper = styled.div`
  display: block;
  margin: 0 auto;
  width: 100%;
`

export const FormBody: StyledComponent<'div', {}, {}> = styled.div`
  position: relative;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: auto;
  border-top: 1px solid var(--tina-color-grey-2);
  background-color: #f6f6f9;

  ${Wrapper} {
    height: 100%;
  }
`

const FormFooter = styled.div`
  position: relative;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  width: 100%;
  height: 64px;
  background-color: white;
  border-top: 1px solid var(--tina-color-grey-2);

  ${Wrapper} {
    flex: 1 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
  }
`

export const SaveButton: StyledComponent<typeof Button, {}, {}> = styled(
  Button
)`
  flex: 1.5 0 auto;
  padding: 12px 24px;
`
