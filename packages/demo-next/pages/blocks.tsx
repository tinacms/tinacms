import * as React from 'react'
import { Form } from 'tinacms'
import { useJsonForm } from 'next-tinacms-json'
import { FormBuilder, FormBuilderProps } from '@tinacms/form-builder'
import { Field, FormRenderProps, FieldRenderProps } from 'react-final-form'

function EditToggle() {
  const { status, deactivate, activate } = React.useContext(InlineFormContext)

  return (
    <button
      onClick={() => {
        status === 'active' ? deactivate() : activate()
      }}
    >
      {status === 'active' ? 'Preview' : 'Edit'}
    </button>
  )
}
/**
 * This is an example page that uses Blocks from Json
 */
export default function BlocksExample({ jsonFile }) {
  const [, form] = useJsonForm(jsonFile)

  if (!form) return null

  return (
    // TODO: Allow regular children
    <InlineForm form={form}>
      {() => (
        <>
          <EditToggle />
          <h1>
            <InlineTextField name="title" />
          </h1>
        </>
      )}
    </InlineForm>
  )
}

BlocksExample.getInitialProps = async function() {
  const blocksData = await import(`../data/blocks.json`)
  return {
    jsonFile: {
      fileRelativePath: `data/index.json`,
      data: blocksData.default,
    },
  }
}

/**
 * InlineForm
 *
 * Sets up a FinaForm context and tracks the state of the form.
 */
interface InlineFormProps {
  form: Form
  children(
    props: FormRenderProps &
      Pick<InlineFormState, 'activate' | 'deactivate' | 'status'>
  ): any
}

interface InlineFormState {
  form: Form
  status: InlineFormStatus
  activate(): void
  deactivate(): void
}
type InlineFormStatus = 'active' | 'inactive'

function InlineForm({ form, children }: InlineFormProps) {
  const [status, setStatus] = React.useState<InlineFormStatus>('inactive')

  const inlineFormState = React.useMemo(() => {
    return {
      form,
      status,
      activate: () => setStatus('active'),
      deactivate: () => setStatus('inactive'),
    }
  }, [form, status])

  return (
    <InlineFormContext.Provider value={inlineFormState}>
      <FormBuilder form={form}>
        {formProps =>
          // @ts-ignore
          children({
            ...inlineFormState,
            ...formProps,
          })
        }
      </FormBuilder>
    </InlineFormContext.Provider>
  )
}

const InlineFormContext = React.createContext<InlineFormState | null>(null)

/**
 *
 */
interface InlineFieldProps {
  name: string
  children(fieldProps: InlineFieldRenderProps): React.ReactElement
}

interface InlineFieldRenderProps<V = any>
  extends Partial<FieldRenderProps<V>>,
    InlineFormState {}

function InlineField({ name, children }: InlineFieldProps) {
  const formState = React.useContext(InlineFormContext)

  return (
    <Field name={name}>
      {fieldProps => {
        return children({
          ...fieldProps,
          ...formState,
        })
      }}
    </Field>
  )
}

/**
 * InlineTextField
 */
interface InlineTextFieldProps {
  name: string
}
function InlineTextField({ name }: InlineTextFieldProps) {
  return (
    <InlineField name={name}>
      {({ input, status }) => {
        if (status === 'active') {
          return <input type="text" {...input} />
        }
        return <>{input.value}</>
      }}
    </InlineField>
  )
}
