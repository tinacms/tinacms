/** A pull request link: `number` keeps the digits as written, such as `0042`, when the URL ends in a pull request number. */
export const parsePullRequest = (
  url: string | undefined
): { href: string; number?: string } | null => {
  if (!url || !URL.canParse(url)) return null;
  const { protocol, pathname, href } = new URL(url);
  if (protocol !== 'https:' && protocol !== 'http:') return null;
  const last = pathname.split('/').filter(Boolean).at(-1) ?? '';
  return /^\d+$/.test(last) ? { href, number: last } : { href };
};
