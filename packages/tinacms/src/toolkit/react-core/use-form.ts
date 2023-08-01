import { FormOptions, Form, Field } from '@toolkit/forms'
import * as React from 'react'
import { usePlugins } from './use-plugin'
import { useCMSEvent } from './use-cms-event'

export interface WatchableFormValue {
  values: any
  label: FormOptions<any>['label']
  fields: FormOptions<any>['fields']
}

/**
 * @deprecated See https://github.com/tinacms/rfcs/blob/master/0006-form-hook-conventions.md
 */
export function useLocalForm<FormShape = any>(
  options: FormOptions<any>,
  watch: Partial<WatchableFormValue> = {}
): [FormShape, Form] {
  const [values, form] = useForm<FormShape>(options, watch)

  usePlugins(form)

  return [values, form]
}

/**
 * A hook that creates a form and updates it's watched properties.
 */
export function useForm<FormShape = any>(
  { loadInitialValues, ...options }: FormOptions<any>,
  watch: Partial<WatchableFormValue> = {}
): [FormShape, Form, boolean] {
  /**
   * `initialValues` will be usually be undefined if `loadInitialValues` is used.
   *
   * If the form helper is using `watch.values`, which would contain
   * the current state of the form, then we set that to the `initialValues`
   * so the form is initialized with some state.
   *
   * This is beneficial for SSR and will hopefully not be noticeable
   * when editing the site as the actual `initialValues` will be set
   * behind the scenes.
   */
  options.initialValues = options.initialValues || watch.values

  const [, setValues] = React.useState(options.initialValues)
  const [form, setForm] = React.useState<Form>(() => {
    return createForm(options, (form: any) => {
      setValues(form.values)
    })
  })

  React.useEffect(
    function () {
      if (form.id === options.id) return
      setForm(
        createForm(options, (form: any) => {
          setValues(form.values)
        })
      )
    },
    [options.id]
  )

  const [formIsLoading, setFormIsLoading] = React.useState(() =>
    loadInitialValues ? true : false
  )
  const loadFormData = React.useCallback(async () => {
    if (loadInitialValues) {
      setFormIsLoading(true)
      await loadInitialValues()
        .then((values: any) => {
          form.updateInitialValues(values)
        })
        .finally(() => {
          setFormIsLoading(false)
        })
    }
  }, [form, setFormIsLoading])
  React.useEffect(() => {
    loadFormData()
  }, [form, loadFormData])
  useCMSEvent(
    'unstable:reload-form-data',
    async () => {
      await loadFormData()
      await form.reset()
    },
    [loadFormData, form]
  )

  useUpdateFormFields(form, watch.fields)
  useUpdateFormLabel(form, watch.label)
  useUpdateFormValues(form, watch.values)

  return [form ? form.values : options.initialValues, form, formIsLoading]
}

function createForm(options: FormOptions<any>, handleChange: any): Form {
  const form = new Form(options)
  form.subscribe(handleChange, { values: true })
  return form
}

/**
 * A React Hook that update's the `Form` if `fields` are changed.
 *
 * This hook is useful when dynamically creating fields, or updating
 * them via hot module replacement.
 */
function useUpdateFormFields(form: Form, fields?: Field[]) {
  React.useEffect(() => {
    if (typeof fields === 'undefined') return
    form.updateFields(fields)
  }, [form, fields])
}

/**
 * A React Hook that update's the `Form` if the `label` is changed.
 *
 * This hook is useful when dynamically creating creating the label,
 * or updating it via hot module replacement.
 */
function useUpdateFormLabel(form: Form, label?: string) {
  React.useEffect(() => {
    if (typeof label === 'undefined') return
    form.label = label
  }, [form, label])
}

/**
 * Updates the Form with new values.
 *
 * Only updates fields that are:
 *
 * 1. registered with the form
 * 2. not currently [active](https://final-form.org/docs/final-form/types/FieldState#active)
 *
 * This hook is useful when the form must be kept in sync with the data source.
 */
function useUpdateFormValues(form: Form, values?: any) {
  React.useEffect(() => {
    if (typeof values === 'undefined') return
    form.updateValues(values)
  }, [form, values])
}
