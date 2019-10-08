import { Form, FormOptions, Field } from '@tinacms/core'
import { useCMSForm, useCMS, watchFormValues } from '@tinacms/react-tinacms'
import { useMemo, useCallback, useState, useEffect } from 'react'

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

  const cms = useCMS()
  const label = jsonNode.fileRelativePath
  const id = jsonNode.fileRelativePath
  const valuesOnDisk = useMemo(
    () => ({
      jsonNode: jsonNode,
      rawJson: JSON.parse(jsonNode.rawJson),
    }),
    [jsonNode]
  )

  const [valuesInGit, setValuesInGit] = useState()
  useEffect(() => {
    cms.api.git
      .show(id)
      .then((git: any) => {
        let rawJson = JSON.parse(git.content)
        setValuesInGit({ ...valuesOnDisk, rawJson })
      })
      .catch((e: any) => {
        console.log('FAILED', e)
      })
  }, [id])

  const fields = formOptions.fields || generateFields(valuesOnDisk.rawJson)

  fields.push({ name: 'jsonNode', component: null })

  const [values, form] = useCMSForm({
    id,
    label,
    initialValues: valuesInGit,
    currentValues: valuesOnDisk,
    fields,
    onSubmit(data) {
      return cms.api.git.onSubmit!({
        files: [data.fileRelativePath],
        message: data.__commit_message || 'Tina commit',
        name: data.__commit_name,
        email: data.__commit_email,
      })
    },
    reset() {
      return cms.api.git.reset({ files: [id] })
    },
    ...formOptions,
  })

  const writeToDisk = useCallback(formState => {
    const { fileRelativePath, rawJson, ...data } = formState.values.rawJson
    cms.api.git.onChange!({
      fileRelativePath: formState.values.jsonNode.fileRelativePath,
      content: JSON.stringify(data, null, 2),
    })
  }, [])

  watchFormValues(form, writeToDisk)

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
  const [currentData, form] = useJsonForm(data, options)

  return render({ form, data: currentData })
}

function validateJsonNode(jsonNode: JsonNode) {
  // TODO
}
