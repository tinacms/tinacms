/**

*/

import path from 'path'
import fs from 'fs-extra'

interface GetPathParams {
  projectDir: string
  filename: string
  allowedTypes: string[]
  errorMessage?: string
}

export const fileExists = ({
  projectDir,
  filename,
  allowedTypes,
}: Omit<GetPathParams, 'errorMessage'>) => {
  if (!fs.existsSync(projectDir)) {
    return false
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

  return Boolean(inputFile)
}

export const getPath = ({
  projectDir,
  filename,
  allowedTypes,
  errorMessage,
}: GetPathParams) => {
  if (!fs.existsSync(projectDir)) {
    if (errorMessage) {
      throw new Error(errorMessage)
    } else {
      throw new Error(`Could not find ${projectDir}`)
    }
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

  if (!inputFile && errorMessage) {
    throw new Error(errorMessage)
  }

  return inputFile
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
