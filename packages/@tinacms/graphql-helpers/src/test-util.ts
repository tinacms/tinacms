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

import prettier from 'prettier'

/**
 *
 * This just formats the template literal with prettier so comparing strings doesn't fail
 * due to differences in whitespace, calling it "gql" has the nice
 * side-effect that IDEs often provide graphql syntax highlighting for it
 */
export function gql(strings: TemplateStringsArray | string[]): string {
  const string = Array.isArray(strings) ? strings.join('\n') : strings
  // @ts-ignore
  return prettier.format(string, { parser: 'graphql' })
}
