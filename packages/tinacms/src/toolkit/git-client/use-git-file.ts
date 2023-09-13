import { useMemo } from 'react'
import { useCMS } from '@toolkit/react-core'
import { GitFile } from './git-file'

export function useGitFile(
  relativePath: string,
  format: (file: any) => string,
  parse: (content: string) => any
) {
  const cms = useCMS()

  return useMemo(
    () => new GitFile(cms, relativePath, format, parse),
    [cms, relativePath, format, parse]
  )
}
