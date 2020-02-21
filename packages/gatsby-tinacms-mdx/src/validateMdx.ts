/**

Copyright 2019 Forestry.io Inc

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

import { transform } from 'buble-jsx-only'

export function validateMDX(value: string): string | undefined {
  const jsx = 'var thing = (<div>' + value + '</div>)'
  try {
    transform(jsx, {
      objectAssign: 'Object.assign',
    })
  } catch (err) {
    console.log(err)
    return '🚨 Malformed MDX please fix before save (additional information has been logged to the console)'
  }
}
