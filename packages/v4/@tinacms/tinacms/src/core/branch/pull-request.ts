/** A pull request link: `number` is set when the URL ends in a pull request number. */
export const parsePullRequest = (
  url: string | undefined
): { href: string; number?: number } | null => {
  if (!url || !URL.canParse(url)) return null;
  const { protocol, pathname, href } = new URL(url);
  if (protocol !== 'https:' && protocol !== 'http:') return null;
  const last = pathname.split('/').filter(Boolean).at(-1) ?? '';
  return /^\d+$/.test(last) ? { href, number: Number(last) } : { href };
};
