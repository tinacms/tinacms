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

/* 
Borrowed from the `mdx-js` runtime: https://github.com/mdx-js/mdx/blob/995b9c991b26274d3fecc7cca810562fc4a1a4b6/packages/runtime/src/index.js#L31-L38 
*/
export function validateMdx(value: string): string | undefined {
  const jsx = 'var thing = (<div>' + value + '</div>)'
  try {
    transform(jsx, {
      objectAssign: 'Object.assign',
    })
  } catch (err) {
    return err
  }
}
