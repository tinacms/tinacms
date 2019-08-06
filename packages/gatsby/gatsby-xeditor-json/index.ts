import { Form, FormOptions } from '@forestryio/cms'
import { useCMSForm, useCMS } from '@forestryio/cms-react'

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
    return [jsonNode, null]
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
      name: `markdownRemark:${jsonNode.id}`,
      initialValues: jsonNode,
      fields: generateFields(jsonNode),
      onSubmit(data) {
        if (process.env.NODE_ENV === 'development') {
          cms.api.git!.onSubmit!({
            fileRelativePath: data.fields.fileRelativePath,
            content: JSON.stringify(data),
          })
        } else {
          console.log('Not supported')
        }
      },
      ...formOptions,
    })

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

interface RemarkFormProps extends Partial<FormOptions<any>> {
  jsonNode: JsonNode
  render(renderProps: { form: Form; data: any }): JSX.Element
}

export function RemarkForm({ jsonNode, render, ...options }: RemarkFormProps) {
  let [data, form] = useJsonForm(jsonNode, options)

  return render({ form, data })
}
