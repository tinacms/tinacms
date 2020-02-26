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

import * as path from 'path'
import * as os from 'os'

export function checkFilePathIsInParent(filepath: string, parent: string) {
  const fullpath = path.resolve(filepath)
  let repopath: string
  if (os.type() === 'Windows_NT') {
    repopath = path.resolve(parent).replace(/\\+$/, '') + '\\'
  } else {
    repopath = path.resolve(parent).replace(/\/+$/, '') + '/'
  }
  return fullpath.startsWith(repopath)
}
