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

interface GetPathParams {
  projectDir: string
  filename: string
  allowedTypes: string[]
  errorMessage: string
}

export const getPath = ({
  projectDir,
  filename,
  allowedTypes,
  errorMessage,
}: GetPathParams) => {
  if (!fs.existsSync(projectDir)) {
    throw new Error(errorMessage)
  }
  // Get file
  const filePaths = allowedTypes.map((ext) =>
    path.join(projectDir, `${filename}.${ext}`)
  )

  // Find the file the user provided
  let inputFile = undefined
  filePaths.every((path) => {
    if (fs.existsSync(path)) {
      inputFile = path
      return false
    }
    return true
  })

  if (!inputFile) {
    throw new Error(errorMessage)
  }

  return inputFile
}

/*
 * Get the schemaPath for a given project dir.
 * It throws an error if there is no `.tina/schema.{ts,js,tsx,jsx}` present
 */
export const getSchemaPath = ({ projectDir }: { projectDir: string }) => {
  const filename = 'schema'
  const allowedTypes = ['js', 'jsx', 'ts', 'tsx']
  const errorMessage = 'Must provide a `.tina/schema.{ts,js,tsx,jsx}`'
  return getPath({ projectDir, filename, allowedTypes, errorMessage })
}

/*
 * Get the clientPath for a given project dir.
 * It throws an error if there is no `.tina/client.{ts,js}` present
 */
export const getClientPath = ({ projectDir }: { projectDir: string }) => {
  const filename = 'client'
  const allowedTypes = ['js', 'ts']
  const errorMessage = 'Must provide a `.tina/client.{ts,js}`'
  return getPath({ projectDir, filename, allowedTypes, errorMessage })
}
