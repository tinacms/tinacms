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
import { getIn, FormApi } from 'final-form'
import { useCMS } from '../react-core'
import { IoMdClose } from 'react-icons/io'

export interface FormBuilderProps {
  form: Form
  hideFooter?: boolean
  label?: string
  onPristineChange?: (_pristine: boolean) => unknown
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

export const FormBuilder: FC<FormBuilderProps> = ({
  form: tinaForm,
  setActiveFormId,
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
  const [activeFields, setActiveFields] = React.useState(null)
  const [selectedField, setSelectedField] = React.useState(null)
  const [path, setPath] = React.useState(null)

  const cms = useCMS()

  React.useMemo(() => {
    cms.events.subscribe('field:selected', (e) => {
      setSelectedField(e.value)
    })
  }, [setSelectedField])

  const handler = ({ selectedField, tinaForm }) => {
    const [formId, fieldName] = selectedField?.split('#')
    const result = getFieldGroup(
      tinaForm,
      fieldName,
      tinaForm.finalForm.getState().values,
      []
    )
    if (result) {
      setPath(result.path)
      setActiveFields(result.fieldGroup)
    } else {
      setPath([])
      setActiveFields(tinaForm.fields)
    }
  }

  React.useEffect(() => {
    if (selectedField) {
      const [formId, fieldName] = selectedField.split('#')
      if (formId !== tinaForm.id) {
        setActiveFormId(formId)
      } else {
        handler({ selectedField, tinaForm })
      }
    }
  }, [selectedField, tinaForm.id])

  React.useEffect(() => {
    if (selectedField) {
      handler({ selectedField, tinaForm })
    }
  }, [tinaForm.id])

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

  useOnChangeEventDispatch({ finalForm, tinaForm })

  const fields = activeFields || tinaForm.fields
  React.useEffect(() => {
    if (selectedField) {
      const [formId, fieldName] = selectedField?.split('#')
      const activeFieldFound = fields.find((f) => f.name === fieldName)
      if (activeFieldFound) {
        setTimeout(() => {
          finalForm.focus(fieldName)
          setSelectedField(null)
        }, 400)
      }
    }
  }, [selectedField])
  React.useEffect(() => {
    if (selectedField) {
      const [formId, fieldName] = selectedField?.split('#')
      const activeFieldFound = fields.find((f) => f.name === fieldName)
      if (activeFieldFound) {
        setTimeout(() => {
          finalForm.focus(fieldName)
          setSelectedField(null)
        }, 400)
      }
    }
  }, [JSON.stringify(fields)])

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
        return (
          <>
            <DragDropContext onDragEnd={moveArrayItem}>
              <FormPortalProvider>
                {path &&
                  path.map((item, index) => {
                    let shouldRender = false
                    const isLastPanel = path.length === index + 1
                    let isSecondToLast = false
                    if (!isLastPanel) {
                      isSecondToLast = path.length === index + 2
                      if (isSecondToLast) {
                        const lastPanel = path[path.length - 1]
                        if (isNumber(lastPanel)) {
                          shouldRender = true
                        }
                      }
                    } else {
                      if (!isNumber(item)) {
                        shouldRender = true
                      }
                    }
                    if (isNumber(item)) {
                      return
                    }

                    if (!shouldRender) {
                      return
                    }
                    return (
                      <PanelHeader
                        key={path.slice(0, index).join('.')}
                        path={path}
                        itemIndex={index}
                        setSelectedField={setSelectedField}
                        tinaFormId={tinaForm.id}
                        onClick={() => {
                          const selectedField = `${tinaForm.id}#${path
                            .slice(0, index + 1)
                            .join('.')}`
                          setSelectedField(selectedField)
                        }}
                      >
                        {item}
                      </PanelHeader>
                    )
                  })}
                <FormWrapper id={tinaForm.id}>
                  {tinaForm && fields.length ? (
                    <FieldsBuilder form={tinaForm} fields={fields} />
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
                      onClick={() => handleSubmit()}
                      disabled={
                        pristine ||
                        submitting ||
                        hasValidationErrors ||
                        (invalid && !dirtySinceLastSubmit)
                      }
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

const getFieldGroup = (
  form: Form,
  fieldName: string,
  values: object,
  prefix: string[]
) => {
  const [name, ...rest] = fieldName.split('.')
  const field = form.fields.find((field) => field.name === name)
  const value = values[name]
  if (field.type === 'object') {
    if (field.templates) {
      if (field.list) {
        const [index, ...rest2] = rest
        if (index) {
          const value2 = value[index]
          const template = field.templates[value2._template]
          if (rest2.length) {
            const result = getFieldGroup(template, rest2.join('.'), value2, [
              ...prefix,
              name,
              index,
            ])
            if (result) {
              return result
            }
          }
          return {
            path: [...prefix, name, index],
            fieldGroup: template.fields.map((field) => {
              return {
                ...field,
                name: `${[...prefix, name, index].join('.')}.${field.name}`,
              }
            }),
          }
        } else {
          return
        }
      } else {
      }
    }
    if (field.fields) {
      if (field.list) {
        const [index, ...rest2] = rest
        if (index) {
          const value2 = value[index]
          if (rest2.length) {
            const result = getFieldGroup(field, rest2.join('.'), value2, [
              ...prefix,
              name,
              index,
            ])
            if (result) {
              return result
            }
          }
          return {
            path: [...prefix, name, index],
            fieldGroup: field.fields.map((field) => {
              return {
                ...field,
                name: `${[...prefix, name, index].join('.')}.${field.name}`,
              }
            }),
          }
        } else {
          return
        }
      } else {
        if (rest.length) {
          const result = getFieldGroup(field, rest.join('.'), value, [
            ...prefix,
            name,
          ])
          if (result) {
            return result
          }
        }
        return {
          path: [...prefix, name],
          fieldGroup: field.fields.map((field) => {
            return {
              ...field,
              name: `${[...prefix, name].join('.')}.${field.name}`,
            }
          }),
        }
      }
    }
  }
}

export const PanelHeader = ({
  path,
  itemIndex,
  setSelectedField,
  onClick,
  tinaFormId,
  children,
}) => {
  return (
    <div
      style={{ zIndex: 1000 }}
      className={`flex relative w-full bg-white hover:bg-gray-50 border-t border-b shadow-sm border-gray-100 px-6`}
    >
      <BreadcrumbDropdown
        setSelectedField={setSelectedField}
        tinaFormId={tinaFormId}
        path={path}
        itemIndex={itemIndex}
      />
      <button
        className={`relative z-40 group text-left w-full py-2 px-2 -mt-px`}
        onClick={onClick}
        tabIndex={-1}
      >
        <div className="flex items-center justify-between gap-3 text-xs tracking-wide font-medium text-gray-700 group-hover:text-blue-400 uppercase max-w-form mx-auto">
          {children}
          <IoMdClose className="h-auto w-5 inline-block opacity-70 -mt-0.5 -mx-0.5" />
        </div>
      </button>
    </div>
  )
}

const isNumber = (item: string) => {
  return !isNaN(Number(item))
}

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { DotsVerticalIcon } from '@heroicons/react/solid'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function BreadcrumbDropdown({
  path,
  itemIndex,
  tinaFormId,
  setSelectedField,
}) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex items-center bg-gray-100 text-gray-400 hover:text-gray-600 focus:outline-none py-2">
          <span className="sr-only">Open options</span>
          <DotsVerticalIcon className="h-5 w-5" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          style={{ zIndex: 1001 }}
          className="absolute left-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <div className="py-1">
            {path.map((item, index) => {
              if (itemIndex === index) {
                return
              }
              if (isNumber(item)) {
                return
              }
              return (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => {
                        const selectedField = `${tinaFormId}#${path
                          .slice(0, index + 1)
                          .join('.')}`
                        setSelectedField(selectedField)
                      }}
                      className={classNames(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'text-left block w-full px-4 py-2  text-xs tracking-wide font-medium text-gray-700 group-hover:text-blue-400 uppercase '
                      )}
                    >
                      {item}
                    </button>
                  )}
                </Menu.Item>
              )
            })}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
