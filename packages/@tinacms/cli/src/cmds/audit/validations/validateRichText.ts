import { AuditIssue, AuditWarning } from '../issue'

export const validateRichText = (node) => {
  let issues: AuditIssue[] = []
  Object.keys(node._values)
    .map((fieldName) => node._values[fieldName])
    .filter((field) => {
      return field?.type == 'root'
    })
    .forEach((field) => {
      const errorMessages = field.children
        .filter((f) => f.type == 'invalid_markdown')
        .map((f) => f.message)

      errorMessages.forEach((errorMessage) => {
        issues.push(new AuditWarning(errorMessage))
      })
    })

  return issues
}
