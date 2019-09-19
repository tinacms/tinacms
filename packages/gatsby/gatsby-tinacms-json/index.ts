import { Form, FormOptions } from '@tinacms/core'
import { useCMSForm, useCMS, watchFormValues } from '@tinacms/react-tinacms'
import { useEffect, useMemo } from 'react'

let get = require('lodash.get')

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
  let name = jsonNode.fileRelativePath
  const id = jsonNode.id
  let initialValues = useMemo(
    () => ({
      jsonNode: jsonNode,
      rawJson: JSON.parse(jsonNode.rawJson),
    }),
    [jsonNode.rawJson]
  )
  let fields = formOptions.fields || generateFields(initialValues.rawJson)

  let [values, form] = useCMSForm({
    id,
    name,
    initialValues,
    fields,
    onSubmit(data) {
      // TODO: Commit & Push
    },
    ...formOptions,
  })

  syncFormWithInitialValues(form, initialValues)

  watchFormValues(form, formState => {
    let { fileRelativePath, rawJson, ...data } = formState.values.rawJson
    cms.api.git.onChange!({
      fileRelativePath: formState.values.jsonNode.fileRelativePath,
      content: JSON.stringify(data, null, 2),
    })
  })

  return [jsonNode, form]
}

function generateFields(post: any) {
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

/**
 * Updates the Form with new values from the MarkdownRemark node.
 *
 * Only updates fields that are:
 *
 * 1. registered with the form
 * 2. not currently active
 *
 * It also updates the `markdownRemark.frontmatter` property. This is
 * in-case that field is being used in previewing.
 */
function syncFormWithInitialValues(form: Form, initialValues: any) {
  useEffect(() => {
    if (!form) return
    form.finalForm.batch(() => {
      /**
       * Only update form fields that are observed.
       */
      form.fields.forEach((field: any) => {
        let state = form.finalForm.getFieldState(field.name)
        if (state && !state.active) {
          form.finalForm.change(field.name, get(initialValues, field.name))
        }
      })

      /**
       * Also update frontmatter incase it's being used for previewing.
       */
      form.finalForm.change('jsonNode', initialValues.jsonNode)
    })
  }, [initialValues])
}
