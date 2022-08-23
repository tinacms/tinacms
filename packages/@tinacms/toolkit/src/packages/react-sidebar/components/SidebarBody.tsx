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
import { FormBuilder, FormStatus } from '../../form-builder'
import { FormMetaPlugin } from '../../../plugins/form-meta'
import { SidebarContext, navBreakpoint } from './Sidebar'
import { BiChevronLeft } from 'react-icons/bi'
import { useWindowWidth } from '@react-hook/window-size'

export const FormsView = ({
  children,
}: {
  children?: React.ReactChild | React.ReactChild[]
}) => {
  const [activeFormId, setActiveFormId] = useState<string>('')
  const cms = useCMS()
  const renderNav =
    // @ts-ignore
    typeof cms?.sidebar?.renderNav !== 'undefined'
      ? // @ts-ignore
        cms.sidebar.renderNav
      : true
  const formPlugins = cms.plugins.getType<Form>('form')
  const { setFormIsPristine } = React.useContext(SidebarContext)

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
              renderNav={renderNav}
              activeForm={activeForm}
              setActiveFormId={setActiveFormId}
            />
          )}
          {!isMultiform && (
            <FormHeader renderNav={renderNav} activeForm={activeForm} />
          )}
          {formMetas &&
            formMetas.map((meta) => (
              <React.Fragment key={meta.name}>
                <meta.Component />
              </React.Fragment>
            ))}
          <FormBuilder
            form={activeForm as any}
            onPristineChange={setFormIsPristine}
          />
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
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  overflow: hidden;
  height: 100%;
  width: 100%;
  position: relative;
  background: white;

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
  renderNav?: boolean
}

export const MultiformFormHeader = ({
  activeForm,
  setActiveFormId,
  renderNav,
}: MultiformFormHeaderProps) => {
  const cms = useCMS()
  const { sidebarWidth, formIsPristine } = React.useContext(SidebarContext)

  return (
    <div
      className={`py-4 border-b border-gray-200 bg-white ${
        sidebarWidth > navBreakpoint && renderNav
          ? `px-6`
          : renderNav
          ? `pl-20 pr-28`
          : `pl-6 pr-28`
      }`}
    >
      <div className="max-w-form mx-auto flex flex-col items-start justify-center min-h-[2.5rem]">
        <button
          className="pointer-events-auto text-xs mb-1 text-gray-400 hover:text-blue-500 hover:underline transition-all ease-out duration-150 font-medium flex items-center justify-start gap-0.5"
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
          <BiChevronLeft className="h-auto w-5 inline-block opacity-70 -mt-0.5 -mx-0.5" />
          Return to Form List
        </button>
        <span className="block w-full text-xl mb-[6px] text-gray-700 font-medium leading-tight">
          {activeForm.label || activeForm.name}
        </span>
        <FormStatus pristine={formIsPristine} />
      </div>
    </div>
  )
}

export interface FormHeaderProps {
  activeForm: Form
  renderNav?: boolean
}

export const FormHeader = ({ renderNav, activeForm }: FormHeaderProps) => {
  const { sidebarWidth, formIsPristine, displayState } =
    React.useContext(SidebarContext)

  const headerPadding = {
    navOpen: 'px-6',
    navClosed: 'pl-20 pr-28',
    noNav: 'pl-6 pr-28',
  }

  const windowWidth = useWindowWidth()
  const navState = !renderNav
    ? 'noNav'
    : (sidebarWidth > navBreakpoint && windowWidth > navBreakpoint) ||
      (displayState === 'fullscreen' && windowWidth > navBreakpoint)
    ? 'navOpen'
    : 'navClosed'

  const shortFormLabel = activeForm.label
    ? activeForm.label.replace(/^.*[\\\/]/, '')
    : false

  return (
    <div
      className={`py-4 border-b border-gray-200 bg-white ${headerPadding[navState]}`}
    >
      <div className="max-w-form mx-auto  flex flex-col items-start justify-center min-h-[2.5rem]">
        {shortFormLabel && (
          <span className="block w-full text-lg mb-[6px] text-gray-700 font-medium leading-tight text-ellipsis overflow-hidden whitespace-nowrap">
            {shortFormLabel}
          </span>
        )}
        <FormStatus pristine={formIsPristine} />
      </div>
    </div>
  )
}

export const SaveButton: StyledComponent<typeof Button, {}, {}> = styled(
  Button as any
)`
  flex: 1.5 0 auto;
  padding: 12px 24px;
`
