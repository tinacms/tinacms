/**

*/

import * as React from 'react'
import { FC, useEffect } from 'react'
import { Form } from '../forms'
import { Form as FinalForm } from 'react-final-form'

import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import { Button } from '../styles'
import { LoadingDots } from './LoadingDots'
import { FormPortalProvider } from './FormPortal'
import { FieldsBuilder } from './fields-builder'
import { ResetForm } from './ResetForm'
import { FormActionMenu } from './FormActions'
import { useCMS } from '../react-core'
import { IoMdClose } from 'react-icons/io'
import { Transition } from '@headlessui/react'

export interface FormBuilderProps {
  form: { tinaForm: Form; activeFieldName?: string }
  hideFooter?: boolean
  label?: string
  onPristineChange?: (_pristine: boolean) => unknown
}

interface FormKeyBindingsProps {
  onSubmit: () => void
}

const NoFieldsPlaceholder = () => (
  <div
    className="relative flex flex-col items-center justify-center text-center p-5 pb-16 w-full h-full overflow-y-auto"
    style={{
      animationName: 'fade-in',
      animationDelay: '300ms',
      animationTimingFunction: 'ease-out',
      animationIterationCount: 1,
      animationFillMode: 'both',
      animationDuration: '150ms',
    }}
  >
    <Emoji className="block pb-5">🤔</Emoji>
    <h3 className="font-sans font-normal text-lg block pb-5">
      Hey, you don't have any fields added to this form.
    </h3>
    <p className="block pb-5">
      <a
        className="text-center rounded-3xl border border-solid border-gray-100 shadow-[0_2px_3px_rgba(0,0,0,0.12)] font-normal cursor-pointer text-[12px] transition-all duration-100 ease-out bg-white text-gray-700 py-3 pr-5 pl-14 relative no-underline inline-block hover:text-blue-500"
        href="https://tinacms.org/docs/fields"
        target="_blank"
      >
        <Emoji
          className="absolute left-5 top-1/2 origin-center -translate-y-1/2 transition-all duration-100 ease-out"
          style={{ fontSize: 24 }}
        >
          📖
        </Emoji>{' '}
        Field Setup Guide
      </a>
    </p>
  </div>
)

const FormKeyBindings: FC<FormKeyBindingsProps> = ({ onSubmit }) => {
  // Submit when cmd/ctrl + s is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        onSubmit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSubmit])

  return null
}

function usePrevious(value) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = React.useRef(null)
  // Store current value in ref
  useEffect(() => {
    ref.current = value
  }, [value]) // Only re-run if value changes
  // Return previous value (happens before update in useEffect above)
  return ref.current
}

export const FormBuilder: FC<FormBuilderProps> = ({
  form,
  onPristineChange,
  ...rest
}) => {
  const cms = useCMS()
  const hideFooter = !!rest.hideFooter

  const tinaForm = form.tinaForm
  const finalForm = form.tinaForm.finalForm

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

  /**
   * Prevent navigation away from the window when the form is dirty
   */
  React.useEffect(() => {
    // const onBeforeUnload = (event) => {
    //   event.preventDefault()
    //   event.returnValue = ''
    // }

    const unsubscribe = finalForm.subscribe(
      ({ pristine }) => {
        if (onPristineChange) {
          onPristineChange(pristine)
        }

        // if (!pristine) {
        //   window.addEventListener('beforeunload', onBeforeUnload)
        // } else {
        //   window.removeEventListener('beforeunload', onBeforeUnload)
        // }
      },
      { pristine: true }
    )
    return () => {
      // window.removeEventListener('beforeunload', onBeforeUnload)
      unsubscribe()
    }
  }, [finalForm])

  const fieldGroup = tinaForm.getActiveField(form.activeFieldName)
  const previousName = usePrevious(fieldGroup.name)
  const animateStatus =
    fieldGroup.name === previousName
      ? 'none'
      : fieldGroup.name
      ? previousName
        ? previousName.length < fieldGroup.name.length
          ? 'forwards'
          : 'backwards'
        : 'forwards'
      : 'none'
  const animationProps = getAnimationProps(animateStatus)

  return (
    <FinalForm
      key={tinaForm.id}
      form={tinaForm.finalForm}
      onSubmit={tinaForm.onSubmit}
    >
      {({
        handleSubmit,
        pristine,
        invalid,
        submitting,
        dirtySinceLastSubmit,
        hasValidationErrors,
      }) => {
        const canSubmit =
          !pristine &&
          !submitting &&
          !hasValidationErrors &&
          !(invalid && !dirtySinceLastSubmit)

        const safeHandleSubmit = () => {
          if (canSubmit) {
            handleSubmit()
          }
        }

        return (
          <>
            <DragDropContext onDragEnd={moveArrayItem}>
              <FormKeyBindings onSubmit={safeHandleSubmit} />
              <FormPortalProvider>
                <Transition
                  className="h-full bg-gray-50"
                  appear={true}
                  show={true}
                  key={fieldGroup.name}
                  {...animationProps}
                >
                  <FormWrapper
                    header={<PanelHeader {...fieldGroup} id={tinaForm.id} />}
                    id={tinaForm.id}
                  >
                    {tinaForm && tinaForm.fields.length ? (
                      <FieldsBuilder
                        form={tinaForm}
                        activeFieldName={form.activeFieldName}
                        fields={fieldGroup.fields}
                      />
                    ) : (
                      <NoFieldsPlaceholder />
                    )}
                  </FormWrapper>
                </Transition>
              </FormPortalProvider>
              {!hideFooter && (
                <div className="relative flex-none w-full h-16 px-6 bg-white border-t border-gray-100	flex items-center justify-center">
                  <div className="flex-1 w-full flex justify-between gap-4 items-center max-w-form">
                    {tinaForm.reset && (
                      <ResetForm
                        pristine={pristine}
                        reset={async () => {
                          finalForm.reset()
                          await tinaForm.reset!()
                        }}
                        style={{ flexGrow: 1 }}
                      >
                        {tinaForm.buttons.reset}
                      </ResetForm>
                    )}
                    <Button
                      onClick={safeHandleSubmit}
                      disabled={!canSubmit}
                      busy={submitting}
                      variant="primary"
                      style={{ flexGrow: 3 }}
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
              )}
            </DragDropContext>
          </>
        )
      }}
    </FinalForm>
  )
}

export const FormStatus = ({ pristine }) => {
  return (
    <div className="flex flex-0 items-center">
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

export const FormWrapper = ({
  header,
  children,
  id,
}: {
  header?: React.ReactNode
  children: React.ReactNode
  id: string
}) => {
  return (
    <div
      data-test={`form:${id?.replace(/\\/g, '/')}`}
      className="h-full overflow-y-auto max-h-full bg-gray-50"
    >
      {header}
      <div className="py-5 px-6">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-form">{children}</div>
        </div>
      </div>
    </div>
  )
}

const Emoji = ({ className = '', ...props }) => (
  <span
    className={`text-[40px] leading-none inline-block ${className}`}
    {...props}
  />
)

const isNumber = (item: string) => {
  return !isNaN(Number(item))
}

const PanelHeader = (props: { label?: string; name?: string; id: string }) => {
  const cms = useCMS()
  const activePath = props.name?.split('.') || []
  if (!activePath || activePath.length === 0) {
    return null
  }

  let lastItemIndex
  activePath.forEach((item, index) => {
    if (!isNumber(item)) {
      lastItemIndex = index
    }
  })
  const returnPath = activePath.slice(0, lastItemIndex)

  return (
    <button
      className={`relative z-40 group text-left w-full bg-white hover:bg-gray-50 py-2 border-t border-b shadow-sm
   border-gray-100 px-6 -mt-px`}
      onClick={() => {
        cms.dispatch({
          type: 'forms:set-active-field-name',
          value: {
            formId: props.id,
            fieldName: returnPath.length > 0 ? returnPath.join('.') : null,
          },
        })
      }}
      tabIndex={-1}
    >
      <div className="flex items-center justify-between gap-3 text-xs tracking-wide font-medium text-gray-700 group-hover:text-blue-400 uppercase max-w-form mx-auto">
        {props.label || props.name || 'Back'}
        <IoMdClose className="h-auto w-5 inline-block opacity-70 -mt-0.5 -mx-0.5" />
      </div>
    </button>
  )
}

const getAnimationProps = (animateStatus) => {
  const forwardsAnimation = {
    enter: 'transform transition ease-in-out duration-500 sm:duration-700',
    enterFrom: 'translate-x-8',
    enterTo: 'translate-x-0',
    leave: 'transform transition ease-in-out duration-500 sm:duration-700',
    leaveFrom: 'translate-x-0',
    leaveTo: 'translate-x-8',
  }
  const backwardsAnimation = {
    enter: 'transform transition ease-in-out duration-500 sm:duration-700',
    enterFrom: '-translate-x-8',
    enterTo: 'translate-x-0',
    leave: 'transform transition ease-in-out duration-500 sm:duration-700',
    leaveFrom: 'translate-x-0',
    leaveTo: '-translate-x-8',
  }

  return animateStatus === 'backwards'
    ? backwardsAnimation
    : animateStatus === 'forwards'
    ? forwardsAnimation
    : {}
}
