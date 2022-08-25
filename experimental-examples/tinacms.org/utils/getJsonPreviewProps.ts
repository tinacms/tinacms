import { readFile } from './readFile'
import path from 'path'

export const getJsonPreviewProps = async (
  fileRelativePath: string,
  preview: boolean,
  previewData: any
) => {
  let file = null
  let error = null

  try {
    file = await getJsonFile(fileRelativePath, preview, previewData)
  } catch (e) {
    error = e
  }

  return {
    props: {
      error,
      preview: !!preview,
      file,
    },
  }
}

export async function getJsonFile<T = any>(
  fileRelativePath: string,
  preview: boolean,
  previewData: any
): Promise<any> {
  return {
    sha: '',
    fileRelativePath,
    data: await readJsonFile(fileRelativePath),
  }
}

export const readJsonFile = async (filePath: string) => {
  const data = await readFile(path.resolve(`${filePath}`))
  return JSON.parse(data)
}
