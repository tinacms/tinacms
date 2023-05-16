/**



*/

import * as React from 'react'

import { Form } from '../../forms'
import { useState } from 'react'
import { FormLists } from './FormList'
import { useCMS, useSubscribable } from '../../react-core'
import { FormBuilder, FormStatus } from '../../form-builder'
import { FormMetaPlugin } from '../../../plugins/form-meta'
import { SidebarContext, navBreakpoint } from './Sidebar'
import { BiChevronLeft } from 'react-icons/bi'
import { useWindowWidth } from '@react-hook/window-size'
import { EditContext } from '@tinacms/sharedctx'
import { PendingFormsPlaceholder } from './NoFormsPlaceHolder'

export const FormsView = ({
  children,
}: {
  children?: React.ReactChild | React.ReactChild[]
}) => {
  const cms = useCMS()
  const renderNav =
    // @ts-ignore
    typeof cms?.sidebar?.renderNav !== 'undefined'
      ? // @ts-ignore
        cms.sidebar.renderNav
      : true
  const { setFormIsPristine } = React.useContext(SidebarContext)
  const { formsRegistering, setFormsRegistering } =
    React.useContext(EditContext)

  React.useMemo(
    () =>
      cms.events.subscribe('forms:register', (event) => {
        if (event.value === 'start') {
          setFormsRegistering(true)
        } else {
          setFormsRegistering(false)
        }
      }),
    []
  )

  const isMultiform = cms.state.forms.length > 1
  const activeForm = cms.state.forms.find(
    ({ tinaForm }) => tinaForm.id === cms.state.activeFormId
  )
  const isEditing = !!activeForm

  /**
   * No Forms
   */
  if (!cms.state.formLists.length) {
    if (formsRegistering) return <PendingFormsPlaceholder />
    return <> {children} </>
  }

  if (isMultiform && !activeForm) {
    return <FormLists isEditing={isEditing} />
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

interface FormWrapperProps {
  isEditing: Boolean
  isMultiform: Boolean
}

const FormWrapper: React.FC<FormWrapperProps> = ({ isEditing, children }) => {
  return (
    <div
      className="flex-1 flex flex-col flex-nowrap overflow-hidden h-full w-full relative bg-white"
      style={
        isEditing
          ? {
              transform: 'none',
              animationName: 'fly-in-left',
              animationDuration: '150ms',
              animationDelay: '0',
              animationIterationCount: 1,
              animationTimingFunction: 'ease-out',
            }
          : {
              transform: 'translate3d(100%, 0, 0)',
            }
      }
    >
      {children}
    </div>
  )
}

export interface MultiformFormHeaderProps {
  activeForm: { activeFieldName?: string; tinaForm: Form }
  renderNav?: boolean
}

export const MultiformFormHeader = ({
  activeForm,
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
          ? `pl-18 pr-24`
          : `pl-6 pr-24`
      }`}
    >
      <div className="max-w-form mx-auto flex flex-col items-start justify-center min-h-[2.5rem]">
        <button
          className="pointer-events-auto text-xs mb-1 text-gray-400 hover:text-blue-500 hover:underline transition-all ease-out duration-150 font-medium flex items-center justify-start gap-0.5"
          onClick={() => {
            const state = activeForm.tinaForm.finalForm.getState()
            if (state.invalid === true) {
              cms.alerts.error('Cannot navigate away from an invalid form.')
            } else {
              cms.dispatch({ type: 'forms:set-active-form-id', value: null })
            }
          }}
        >
          <BiChevronLeft className="h-auto w-5 inline-block opacity-70 -mt-0.5 -mx-0.5" />
          Form List
        </button>
        <span className="block w-full text-lg mb-[6px] text-gray-700 font-medium leading-tight truncate">
          {activeForm.tinaForm.label || activeForm.tinaForm.id}
        </span>
        <FormStatus pristine={formIsPristine} />
      </div>
    </div>
  )
}

export interface FormHeaderProps {
  activeForm: { activeFieldName?: string; tinaForm: Form }
  renderNav?: boolean
}

export const FormHeader = ({ renderNav, activeForm }: FormHeaderProps) => {
  const { sidebarWidth, formIsPristine, displayState } =
    React.useContext(SidebarContext)

  const headerPadding = {
    navOpen: 'px-6',
    navClosed: 'pl-18 pr-24',
    noNav: 'pl-6 pr-24',
  }

  const windowWidth = useWindowWidth()
  const navState = !renderNav
    ? 'noNav'
    : (sidebarWidth > navBreakpoint && windowWidth > navBreakpoint) ||
      (displayState === 'fullscreen' && windowWidth > navBreakpoint)
    ? 'navOpen'
    : 'navClosed'

  const shortFormLabel = activeForm.tinaForm.label
    ? activeForm.tinaForm.label.replace(/^.*[\\\/]/, '')
    : false

  return (
    <div
      className={`py-4 border-b border-gray-200 bg-white ${headerPadding[navState]}`}
    >
      <div className="max-w-form mx-auto  flex flex-col items-start justify-center min-h-[2.5rem]">
        {shortFormLabel && (
          <span className="block w-full text-lg mb-[6px] text-gray-700 font-medium leading-tight truncate">
            {shortFormLabel}
          </span>
        )}
        <FormStatus pristine={formIsPristine} />
      </div>
    </div>
  )
}
