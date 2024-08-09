import type { Form } from '@toolkit/forms'
import get from 'lodash.get'

export function getFlattenedFormValues(form: Form) {
  const flatData: any = {}
  const values = form.values
  form.finalForm.getRegisteredFields().forEach((field: string | number) => {
    const data = get(values, field)
    if (typeof data === 'object') return
    flatData[field] = data
  })
  return flatData
}
