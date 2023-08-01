import * as React from 'react'

import { Form } from '@toolkit/forms'
import { FormLists } from './form-list'
import { useCMS } from '@toolkit/react-core'
import { FormBuilder, FormStatus } from '@toolkit/form-builder'
import { FormMetaPlugin } from '@toolkit/plugin-form-meta'
import { SidebarContext } from './sidebar'
import { BiHomeAlt } from 'react-icons/bi'
import { EditContext } from '@tinacms/sharedctx'
import { PendingFormsPlaceholder } from './no-forms-placeholder'

export const FormsView = ({
  children,
}: {
  children?: React.ReactChild | React.ReactChild[]
}) => {
  const cms = useCMS()
  const { setFormIsPristine } = React.useContext(SidebarContext)
  const { formsRegistering, setFormsRegistering } = React.useContext<{
    formsRegistering: boolean
    setFormsRegistering: (_value: boolean) => void
  }>(EditContext)

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
          {isMultiform && <MultiformFormHeader activeForm={activeForm} />}
          {!isMultiform && <FormHeader activeForm={activeForm} />}
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
}

export const MultiformFormHeader = ({
  activeForm,
}: MultiformFormHeaderProps) => {
  const cms = useCMS()
  const { formIsPristine } = React.useContext(SidebarContext)

  return (
    <div
      className={`pt-18 pb-4 px-6 border-b border-gray-200 bg-gradient-to-t from-white to-gray-50`}
    >
      <div className="max-w-form mx-auto flex gap-2 justify-between items-center">
        <button
          className="pointer-events-auto text-xs text-blue-400 hover:text-blue-500 hover:underline transition-all ease-out duration-150"
          onClick={() => {
            const state = activeForm.tinaForm.finalForm.getState()
            if (state.invalid === true) {
              cms.alerts.error('Cannot navigate away from an invalid form.')
            } else {
              cms.dispatch({ type: 'forms:set-active-form-id', value: null })
            }
          }}
        >
          <BiHomeAlt className="h-auto w-5 inline-block opacity-70" />
        </button>
        <span className="opacity-30 text-sm leading-tight whitespace-nowrap flex-0">
          /
        </span>
        <span className="block w-full text-sm leading-tight whitespace-nowrap truncate">
          {activeForm.tinaForm.label || activeForm.tinaForm.id}
        </span>
        <FormStatus pristine={formIsPristine} />
      </div>
    </div>
  )
}

export interface FormHeaderProps {
  activeForm: { activeFieldName?: string; tinaForm: Form }
}

export const FormHeader = ({ activeForm }: FormHeaderProps) => {
  const { formIsPristine } = React.useContext(SidebarContext)

  const shortFormLabel = activeForm.tinaForm.label
    ? activeForm.tinaForm.label.replace(/^.*[\\\/]/, '')
    : false

  return (
    <div
      className={`pt-18 pb-4 px-6 border-b border-gray-200 bg-gradient-to-t from-white to-gray-50`}
    >
      <div className="max-w-form mx-auto flex gap-2 justify-between items-center">
        {shortFormLabel && (
          <span className="block w-full text-sm leading-tight whitespace-nowrap truncate">
            {shortFormLabel}
          </span>
        )}
        <FormStatus pristine={formIsPristine} />
      </div>
    </div>
  )
}
