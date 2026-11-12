import { useEffect, useState } from 'react';

/**
 * Words screen readers hear once while something loads. The status fills after it mounts, because
 * a status that mounts with its words already in is often not read.
 */
export function useLoadingWords(loading: boolean, words: string): string {
  const [said, setSaid] = useState('');
  useEffect(() => setSaid(loading ? words : ''), [loading, words]);
  return said;
}
