export const sanitizeUrl = (url: string | undefined): string => {
  const allowedSchemes = ['http', 'https', 'mailto', 'tel', 'xref'];
  if (!url) return '';

  let parsedUrl: URL | null = null;

  try {
    parsedUrl = new URL(url);
  } catch (error) {
    return url;
  }

  const scheme = parsedUrl.protocol.slice(0, -1);
  if (!allowedSchemes.includes(scheme)) {
    console.warn(`Invalid URL scheme detected ${scheme}`);
    return '';
  }

  if (parsedUrl.pathname === '/') {
    if (url.endsWith('/')) {
      return parsedUrl.href;
    }
    return `${parsedUrl.origin}${parsedUrl.search}${parsedUrl.hash}`;
  }
  return parsedUrl.href;
};

