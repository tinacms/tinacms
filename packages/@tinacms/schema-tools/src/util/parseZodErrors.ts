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

import type { ZodError } from 'zod'

export const parseZodError = ({ zodError }: { zodError: ZodError }) => {
  const errors = zodError.flatten((issue) => {
    const moreInfo = []
    if (issue.code === 'invalid_union') {
      issue.unionErrors.map((unionError) => {
        moreInfo.push(parseZodError({ zodError: unionError }))
      })
      // moreInfo.push(issue.unionErrors.map((x) => x.flatten()))
    }
    const errorMessage = `Error ${issue?.message} at path ${issue.path.join(
      '.'
    )}`
    const errorMessages = [errorMessage, ...moreInfo]

    return {
      errors: errorMessages as string[],
    }
  })
  const formErrors = errors.formErrors.flatMap((x) => x.errors)

  const parsedErrors = [
    ...(errors.fieldErrors?.collections?.flatMap((x) => x.errors) || []),
    ...(errors.fieldErrors?.config?.flatMap((x) => x.errors) || []),
    ...formErrors,
  ]
  return parsedErrors
}
