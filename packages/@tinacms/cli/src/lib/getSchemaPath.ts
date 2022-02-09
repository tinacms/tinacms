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
