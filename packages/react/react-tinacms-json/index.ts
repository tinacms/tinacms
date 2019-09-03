import { Form, FormOptions } from '@tinacms/core'
import { useCMSForm, useCMS } from '@tinacms/cms-react'
import { useEffect } from 'react'

interface JsonNode {
  fields: {
    fileRelativePath: string
  }
  [key: string]: any
}

export function useJsonForm(
  jsonNode: JsonNode,
  formOptions: Partial<FormOptions<any>> = {}
) {
  if (!jsonNode) {
    return [{}, null]
  }
  // TODO: Only required when saving to local filesystem.
  if (
    typeof jsonNode.fields === 'undefined' ||
    typeof jsonNode.fields.fileRelativePath === 'undefined'
  ) {
    // TODO
    // throw new Error(ERROR_MISSING_REMARK_PATH)
  }
  try {
    let cms = useCMS()

    let [values, form] = useCMSForm({
      name: jsonNode.fields.fileRelativePath,
      initialValues: jsonNode,
      fields: generateFields(jsonNode),
      onSubmit(data) {
        if (process.env.NODE_ENV === 'development') {
          //
        } else {
          console.log('Not supported')
        }
      },
      ...formOptions,
    })

    useEffect(() => {
      if (!form) return
      return form.subscribe(
        (formState: any) => {
          let { fields, ...data } = formState.values
          cms.api.git!.onChange!({
            fileRelativePath: fields.fileRelativePath,
            content: JSON.stringify(data, null, 2),
          })
        },
        { values: true }
      )
    }, [form])

    return [jsonNode, form]
  } catch (e) {
    // throw new Error(ERROR_MISSING_CMS_GATSBY)
    throw e
  }
}

function generateFields(post: JsonNode) {
  let { fields, ...dataFields } = post
  return Object.keys(dataFields).map(key => ({
    component: 'text',
    name: key,
  }))
}

interface JsonFormProps extends Partial<FormOptions<any>> {
  data: JsonNode
  render(renderProps: { form: Form; data: any }): JSX.Element
}

export function JsonForm({ data, render, ...options }: JsonFormProps) {
  let [currentData, form] = useJsonForm(data, options)

  return render({ form, data: currentData })
}
