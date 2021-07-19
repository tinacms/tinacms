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

import Ajv from 'ajv'

export const validator = ({ fix }) => {
  if (fix) {
    return new Ajv({
      allErrors: true,
      verbose: true,
      removeAdditional: true,
      coerceTypes: 'array',
      $data: true,
    }).addKeyword('removeIfFails', {
      // https://github.com/ajv-validator/ajv/issues/300#issuecomment-247667922
      inline(it) {
        return `if (errors) {
            vErrors.length = errs_${it.dataLevel || ''};
            errors = errs_${it.dataLevel || ''};
            delete data${it.dataLevel - 1 || ''}[${
          it.dataPathArr[it.dataLevel]
        }];
        }`
      },
      statements: true,
    })
  }

  return new Ajv({
    allErrors: true,
    verbose: true,
    $data: true,
  })
}
