import { useMemo } from 'react';
import { useCMS } from '@toolkit/react-core';
import { GitFile } from './git-file';

/**
 * @deprecated as the API is clunky and hard to use. Mutations should now be
 * done via Graphql. This will be removed by July 2025.
 */
export function useGitFile(
  relativePath: string,
  format: (file: any) => string,
  parse: (content: string) => any
) {
  const cms = useCMS();

  return useMemo(
    () => new GitFile(cms, relativePath, format, parse),
    [cms, relativePath, format, parse]
  );
}
