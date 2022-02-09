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

import path from 'path'
import fs from 'fs-extra'

const ErrorMessage = 'Must provide a `.tina/schema.{ts,js,tsx,jsx}`'
/*
 * Get the schemaPath for a given project dir. It throws an error if there is no `.tina/schema.{ts,js,tsx,jsx}` present
 */
export const getSchemaPath = ({ projectDir }: { projectDir: string }) => {
  if (!fs.existsSync(projectDir)) {
    throw new Error(ErrorMessage)
  }
  // Get file
  const inputPathTS = path.join(projectDir, 'schema.ts')
  const inputPathJS = path.join(projectDir, 'schema.js')
  const inputPathTSX = path.join(projectDir, 'schema.tsx')
  const inputPathJSX = path.join(projectDir, 'schema.jsx')
  let inputFile

  // Find the file the user provided
  if (fs.existsSync(inputPathTS)) {
    inputFile = inputPathTS
  } else if (fs.existsSync(inputPathJS)) {
    inputFile = inputPathJS
  } else if (fs.existsSync(inputPathTSX)) {
    inputFile = inputPathTSX
  } else if (fs.existsSync(inputPathJSX)) {
    inputFile = inputPathJSX
  }
  if (!inputFile) {
    throw new Error(ErrorMessage)
  }
  return inputFile
}
