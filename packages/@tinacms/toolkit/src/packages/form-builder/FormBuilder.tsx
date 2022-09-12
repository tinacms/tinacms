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
import { Form as FinalForm, FormSpy } from 'react-final-form'

import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import { Button } from '../styles'
import { ModalProvider } from '../react-modals'
import { LoadingDots } from './LoadingDots'
import { FormPortalProvider } from './FormPortal'
import { FieldsBuilder } from './fields-builder'
import { ResetForm } from './ResetForm'
import { FormActionMenu } from './FormActions'
import { getIn, FormApi } from 'final-form'
import { useCMS } from '../react-core'

export interface FormBuilderProps {
  form: Form
  hideFooter?: boolean
  label?: string
  onPristineChange?: (pristine: boolean) => unknown
}

const NoFieldsPlaceholder = () => (
  <EmptyState>
    <Emoji>🤔</Emoji>
    <h3 className="font-sans font-normal text-lg">
      Hey, you don't have any fields added to this form.
    </h3>
    <p>
      <LinkButton href="https://tinacms.org/docs/fields" target="_blank">
        <Emoji>📖</Emoji> Field Setup Guide
      </LinkButton>
    </p>
  </EmptyState>
)

export const FormBuilder: FC<FormBuilderProps> = ({
  form: tinaForm,
  onPristineChange,
  ...rest
}) => {
  const hideFooter = !!rest.hideFooter
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

  /**
   * Prevent navigation away from the window when the form is dirty
   */
  React.useEffect(() => {
    const onBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }

    const unsubscribe = finalForm.subscribe(
      ({ pristine }) => {
        if (onPristineChange) {
          onPristineChange(pristine)
        }

        if (!pristine) {
          window.addEventListener('beforeunload', onBeforeUnload)
        } else {
          window.removeEventListener('beforeunload', onBeforeUnload)
        }
      },
      { pristine: true }
    )
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      unsubscribe()
    }
  }, [finalForm])

  useOnChangeEventDispatch({ finalForm, tinaForm })

  return (
    <FinalForm
      form={finalForm}
      key={`${i}: ${tinaForm.id}`}
      onSubmit={tinaForm.onSubmit}
    >
      {({ handleSubmit, pristine, invalid, submitting }) => {
        return (
          <>
            <DragDropContext onDragEnd={moveArrayItem}>
              <FormPortalProvider>
                <FormWrapper id={tinaForm.id}>
                  {tinaForm && tinaForm.fields.length ? (
                    <FieldsBuilder form={tinaForm} fields={tinaForm.fields} />
                  ) : (
                    <NoFieldsPlaceholder />
                  )}
                </FormWrapper>
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
                        // @ts-ignore FIXME twind
                        style={{ flexGrow: 1 }}
                      >
                        {tinaForm.buttons.reset}
                      </ResetForm>
                    )}
                    <Button
                      onClick={() => handleSubmit()}
                      disabled={pristine || submitting || invalid}
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

export const FullscreenFormBuilder: FC<FormBuilderProps> = ({
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
                    <h4 className="font-bold font-sans text-lg opacity-80">
                      {label}
                    </h4>
                  )}
                  <div className="flex flex-1 gap-4 items-center justify-end">
                    <FormStatus pristine={pristine} />
                    {tinaForm.reset && (
                      <ResetForm
                        pristine={pristine}
                        reset={async () => {
                          finalForm.reset()
                          await tinaForm.reset!()
                        }}
                        // @ts-ignore FIXME twind
                        style={{ flexBasis: '7rem' }}
                      >
                        {tinaForm.buttons.reset}
                      </ResetForm>
                    )}
                    <Button
                      onClick={() => handleSubmit()}
                      disabled={pristine || submitting || invalid}
                      busy={submitting}
                      variant="primary"
                      style={{ flexBasis: '10rem' }}
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
                  <FormWrapper id={tinaForm.id}>
                    {tinaForm && tinaForm.fields.length ? (
                      <FieldsBuilder form={tinaForm} fields={tinaForm.fields} />
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

export const FormWrapper = ({ children, id }) => {
  return (
    <div
      data-test={`form:${id?.replace(/\\/g, '/')}`}
      className="h-full overflow-y-auto max-h-full bg-gray-50 pt-6 px-6 pb-2"
    >
      <div className="w-full flex justify-center">
        <div className="w-full max-w-form">{children}</div>
      </div>
    </div>
  )
}

/**
 *
 * Subscribes to final form value changes and dispatches an event
 * with information specific to which field changed.
 */
const useOnChangeEventDispatch = ({
  finalForm,
  tinaForm,
}: {
  finalForm: FormApi<any, Partial<any>>
  tinaForm: Form
}) => {
  const [formValues, setFormValues] = React.useState({})
  const [newUpdate, setNewUpdate] = React.useState(null)

  const { subscribe } = finalForm

  React.useEffect(() => {
    subscribe(
      ({ values }) => {
        setFormValues(values)
      },
      { values: true }
    )
  }, [subscribe, setFormValues])
  const cms = useCMS()

  React.useEffect(() => {
    if (newUpdate?.name === 'reset') {
      cms.events.dispatch({
        type: `forms:reset`,
        value: null,
        mutationType: newUpdate.mutationType,
        formId: tinaForm.id,
      })
      setNewUpdate(null)
    } else if (newUpdate?.name) {
      const previousValue = newUpdate.field.value
      const newValue = getIn(formValues, newUpdate?.name)
      cms.events.dispatch({
        type: `forms:fields:onChange`,
        value: newValue,
        previousValue,
        mutationType: newUpdate.mutationType,
        formId: tinaForm.id,
        field: newUpdate.field,
      })
      setNewUpdate(null)
    }
  }, [JSON.stringify(formValues), cms])

  const { change, reset } = finalForm
  const { insert, move, remove, ...moreMutators } = finalForm.mutators

  const prepareNewUpdate = (
    name: string,
    mutationType:
      | { type: 'change' }
      | { type: 'insert'; at: string }
      | { type: 'move'; from: string; to: string }
      | { type: 'remove'; at: string }
      | { type: 'reset' }
  ) => {
    setNewUpdate({
      name,
      field: finalForm.getFieldState(name),
      mutationType,
    })
  }

  React.useMemo(() => {
    finalForm.reset = (initialValues) => {
      prepareNewUpdate('reset', { type: 'reset' })
      return reset(initialValues)
    }
    finalForm.change = (name, value) => {
      prepareNewUpdate(name.toString(), { type: 'change' })
      return change(name, value)
    }

    finalForm.mutators = {
      insert: (...args) => {
        prepareNewUpdate(args[0], { type: 'insert', at: args[1] })
        insert(...args)
      },
      move: (...args) => {
        prepareNewUpdate(args[0], {
          type: 'move',
          from: args[1],
          to: args[2],
        })
        move(...args)
      },
      remove: (...args) => {
        prepareNewUpdate(args[0], { type: 'remove', at: args[1] })
        remove(...args)
      },
      ...moreMutators,
    }
  }, [JSON.stringify(formValues)])
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
