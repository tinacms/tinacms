import { Form, FormOptions, Field } from '@tinacms/core'
import { useCMSForm, useCMS, watchFormValues } from '@tinacms/react-tinacms'
import { useMemo } from 'react'

interface JsonNode {
  id: string
  rawJson: string
  fileRelativePath: string
  [key: string]: string
}

export function useJsonForm(
  jsonNode: JsonNode,
  formOptions: Partial<FormOptions<any>> = {}
) {
  if (!jsonNode) {
    return [{}, null]
  }
  validateJsonNode(jsonNode)

  let cms = useCMS()
  let label = jsonNode.fileRelativePath
  const id = jsonNode.id
  let initialValues = useMemo(
    () => ({
      jsonNode: jsonNode,
      rawJson: JSON.parse(jsonNode.rawJson),
    }),
    [jsonNode.rawJson]
  )
  let fields = formOptions.fields || generateFields(initialValues.rawJson)

  fields.push({ name: 'jsonNode', component: null })

  let [values, form] = useCMSForm({
    id,
    label,
    initialValues,
    fields,
    onSubmit(data) {
      // TODO: Commit & Push
    },
    ...formOptions,
  })

  watchFormValues(form, formState => {
    let { fileRelativePath, rawJson, ...data } = formState.values.rawJson
    cms.api.git.onChange!({
      fileRelativePath: formState.values.jsonNode.fileRelativePath,
      content: JSON.stringify(data, null, 2),
    })
  })

  return [jsonNode, form]
}

function generateFields(post: any): Field[] {
  return Object.keys(post).map(key => ({
    component: 'text',
    name: `rawJson.${key}`,
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

function validateJsonNode(jsonNode: JsonNode) {
  // TODO
}
