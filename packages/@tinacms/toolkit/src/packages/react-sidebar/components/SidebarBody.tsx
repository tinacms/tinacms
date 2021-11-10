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

import { Form } from '../../forms'
import { useState } from 'react'
import styled, { keyframes, css, StyledComponent } from 'styled-components'
import { Button } from '../../styles'
import { FormList } from './FormList'
import { useCMS, useSubscribable } from '../../react-core'
import { LeftArrowIcon } from '../../icons'
import { FormBuilder } from '../../form-builder'
import { FormMetaPlugin } from '../../../plugins/form-meta'

export const FormsView = ({
  children,
}: {
  children?: React.ReactChild | React.ReactChild[]
}) => {
  const [activeFormId, setActiveFormId] = useState<string>('')
  const cms = useCMS()
  const formPlugins = cms.plugins.getType<Form>('form')

  /**
   * If there's only one form, make it the active form.
   *
   * TODO: There's an issue where the forms register one
   * by one, so the 'active form' always gets set as if there
   * were only one form, even when there are multiple
   */

  function setSingleActiveForm() {
    if (formPlugins.all().length === 1) {
      setActiveFormId(formPlugins.all()[0].id)
    }
  }

  /*
   ** Subscribes the forms to the CMS,
   ** passing a callback to set active form
   */
  useSubscribable(formPlugins, () => {
    setSingleActiveForm()
  })

  /*
   ** Sets single active form on componentDidMount
   */
  React.useEffect(() => {
    setSingleActiveForm()
  }, [])

  const forms = formPlugins.all()
  const isMultiform = forms.length > 1
  const activeForm: Form | undefined = formPlugins.find(activeFormId)
  const isEditing = !!activeForm

  /**
   * No Forms
   */
  if (!forms.length) {
    return <> {children} </>
  }

  if (isMultiform && !activeForm) {
    return (
      <FormList
        isEditing={isEditing}
        forms={forms}
        setActiveFormId={setActiveFormId}
      />
    )
  }

  const formMetas = cms.plugins.all<FormMetaPlugin>('form:meta')

  return (
    <>
      {activeForm && (
        <FormWrapper isEditing={isEditing} isMultiform={isMultiform}>
          {isMultiform && (
            <MultiformFormHeader
              activeForm={activeForm}
              setActiveFormId={setActiveFormId}
            />
          )}
          {!isMultiform && activeForm.label && (
            <FormHeader activeForm={activeForm} />
          )}
          {formMetas &&
            formMetas.map((meta) => (
              <React.Fragment key={meta.name}>
                <meta.Component />
              </React.Fragment>
            ))}
          <FormBuilder form={activeForm as any} />
        </FormWrapper>
      )}
    </>
  )
}

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
  background-color: var(--tina-color-grey-1);

  ${Wrapper} {
    height: 100%;
  }
`

const FormAnimationKeyframes = keyframes`
  0% {
    transform: translate3d( 100%, 0, 0 );
  }
  100% {
    transform: translate3d( 0, 0, 0 );
  }
`

interface FormWrapperProps {
  isEditing: Boolean
  isMultiform: Boolean
}

const FormWrapper = styled.div<FormWrapperProps>`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  overflow: hidden;
  height: 100%;
  width: 100%;
  position: relative;

  > * {
    transform: translate3d(100%, 0, 0);
  }

  ${(p) =>
    p.isEditing &&
    css`
      > * {
        transform: none;
        animation-name: ${FormAnimationKeyframes};
        animation-duration: 150ms;
        animation-delay: 0;
        animation-iteration-count: 1;
        animation-timing-function: ease-out;
      }
    `};
`

export interface MultiformFormHeaderProps {
  activeForm: Form
  setActiveFormId(id: string): void
}

export const MultiformFormHeader = styled(
  ({
    activeForm,
    setActiveFormId,
    ...styleProps
  }: MultiformFormHeaderProps) => {
    const cms = useCMS()

    return (
      <button
        {...styleProps}
        onClick={() => {
          const state = activeForm.finalForm.getState()
          if (state.invalid === true) {
            // @ts-ignore
            cms.alerts.error('Cannot navigate away from an invalid form.')
          } else {
            setActiveFormId('')
          }
        }}
      >
        <LeftArrowIcon />
        <span>{activeForm.label}</span>
      </button>
    )
  }
)`
  position: relative;
  width: 100%;
  cursor: pointer;
  border: none;
  background-image: none;
  background-color: white;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  padding: 0 var(--tina-padding-big) 10px var(--tina-padding-big);
  font-size: var(--tina-font-size-5);
  transition: color 250ms ease-out;
  user-select: none;

  span {
    flex: 1 1 auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
  }

  svg {
    flex: 0 0 auto;
    width: 24px;
    fill: var(--tina-color-grey-3);
    height: auto;
    transform: translate3d(-4px, 0, 0);
    transition: transform 150ms ease-out;
  }

  :hover,
  :active {
    color: var(--tina-color-primary);
    outline: none;
    border: none;

    svg {
      fill: var(--tina-color-grey-8);
      transform: translate3d(-7px, 0, 0);
      transition: transform var(--tina-timing-long) ease;
    }
  }
`

export interface FormHeaderProps {
  activeForm: Form
}

export const FormHeader = styled(
  ({ activeForm, ...styleProps }: FormHeaderProps) => {
    return (
      <div {...styleProps}>
        <span>{activeForm.label}</span>
      </div>
    )
  }
)`
  position: relative;
  width: 100%;
  background-color: white;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  padding: 0 var(--tina-padding-big) 10px var(--tina-padding-big);
  font-size: var(--tina-font-size-5);
  user-select: none;

  span {
    flex: 1 1 auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

export const SaveButton: StyledComponent<typeof Button, {}, {}> = styled(
  Button as any
)`
  flex: 1.5 0 auto;
  padding: 12px 24px;
`
