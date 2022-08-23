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
        issues.push(new AuditWarning(errorMessage, node._sys.path))
      })
    })

  return issues
}
