/**

*/

import * as React from 'react'
import { FC, useEffect } from 'react'
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
import { getIn, FormApi } from 'final-form'
import { useCMS } from '../react-core'
import { SchemaField } from '@tinacms/schema-tools'
import { Transition } from '@headlessui/react'

export interface FormBuilderProps {
  form: Form
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

  const [state, setState] = React.useState<{
    direction: 'in' | 'out'
    current: State
    next?: State
  }>({
    direction: 'in',
    current: {
      fields: tinaForm.fields,
      depth: [],
    },
    next: null,
  })

  React.useEffect(() => {
    console.log(state)
  }, [JSON.stringify(state)])

  const setActiveFields = (fieldName: string) => {
    const nameArray = fieldName.split('.')
    const getField = (
      nameArray: string[],
      fields: SchemaField[],
      depth: { name: string; index?: number }[] = []
    ) => {
      const [name, ...rest] = nameArray
      if (name === '') {
        return { depth: [], fields: tinaForm.fields }
      }
      const field = fields.find((field) => field.name === name)
      if (!field) {
        throw new Error(`Expected to find field with name ${name}`)
      }
      let nextFields: SchemaField[] = []
      if (field.type === 'object') {
        if (field.list) {
          const [index, ...rest2] = rest
          depth.push({ name, index: Number(index) })
          if (field.templates) {
            const parentValues =
              tinaForm.finalForm.getState().values[field.name]
            const fieldValue = parentValues[index]
            const template = field.templates.find(
              (template) => template.name === fieldValue._template
            )
            if (rest2.length > 0) {
              return getField(rest2, template.fields, depth)
            }
            nextFields = template.fields
          }
          if (field.fields) {
            if (rest2.length > 0) {
              return getField(rest2, field.fields, depth)
            }
            nextFields = field.fields
          }
        } else {
          depth.push({ name })
        }
      } else {
        throw new Error(
          `Received field group event for field with no sub-fields`
        )
      }
      return { depth, fields: nextFields }
    }
    const { depth, fields } = getField(nameArray, tinaForm.fields)
    if (depth.length > state.current.depth.length) {
      setState((state) => ({
        ...state,
        next: {
          fields,
          depth,
        },
      }))
    } else {
      setState((state) => ({
        direction: 'out',
        current: {
          fields,
          depth,
        },
        next: state.current,
      }))
    }
  }

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

  useOnChangeEventDispatch({ finalForm, tinaForm })

  // This will be needed when we add rename and delete functionality to this page
  // const cms = useCMS()
  // const id: string = tinaForm.id
  // const schema = cms.api.tina.schema
  // const collection = schema.getCollectionByFullPath(id)

  return (
    <FinalForm
      form={finalForm}
      key={`${i}: ${tinaForm.id}`}
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
const Animate = ({ direction, show, afterEnter, children }) => {
  const duration = 'duration-300'
  const animateIn = {
    enter: `transition ease-in-out ${duration} transform`,
    enterFrom: 'translate-x-full',
    enterTo: 'translate-x-0  absolute inset-0 w-full h-full z-20',
    leave: `transition ease-in-out ${duration} transform`,
    leaveFrom: 'translate-x-0 absolute inset-0 w-full h-full z-20',
    leaveTo: 'translate-x-full',
  }
  const animateOut = {
    enter: `transition ease-in-out transform absolute inset-0 w-full h-full z-20`,
    enterFrom: 'translate-x-0',
    enterTo: 'translate-x-full',
    leave: `transition ease-in-out ${duration} transform  absolute inset-0 w-full h-full z-20`,
    leaveFrom: 'translate-x-full',
    leaveTo: 'translate-x-0',
  }
  const animation = direction === 'in' ? animateIn : animateOut
  return (
    <Transition
      {...animation}
      appear={true}
      show={show}
      afterEnter={() => afterEnter()}
    >
      {children}
    </Transition>
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
          const canSubmit = !pristine && !submitting && !invalid

          const safeHandleSubmit = () => {
            if (canSubmit) {
              handleSubmit()
            }
          }

          return (
            <DragDropContext onDragEnd={moveArrayItem}>
              <FormKeyBindings onSubmit={safeHandleSubmit} />

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
                        style={{ flexBasis: '7rem' }}
                      >
                        {tinaForm.buttons.reset}
                      </ResetForm>
                    )}
                    <Button
                      onClick={safeHandleSubmit}
                      disabled={!canSubmit}
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
      className="h-full overflow-y-auto max-h-full bg-gray-50 py-5 px-6"
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
      // it seems that on the first update newUpdate?field was undefined (only mattered if calling `onChange` on your own)
      const previousValue = newUpdate?.field?.value
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

const Emoji = ({ className = '', ...props }) => (
  <span
    className={`text-[40px] leading-none inline-block ${className}`}
    {...props}
  />
)

export const getPath = (depth: Depth[]) => {
  return depth
    .map(({ name, index }) => {
      return isNaN(index) ? name : `${name}.${index}`
    })
    .join('.')
}
