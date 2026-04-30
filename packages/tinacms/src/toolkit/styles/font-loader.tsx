import * as React from 'react';

export function FontLoader({ fontUrl }: { fontUrl?: string } = {}) {
  React.useEffect(() => {
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Libre+Baskerville:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    let customLink: HTMLLinkElement | null = null;
    if (fontUrl) {
      customLink = document.createElement('link');
      customLink.href = fontUrl;
      customLink.rel = 'stylesheet';
      document.head.appendChild(customLink);
    }

    return () => {
      document.head.removeChild(link);
      if (customLink) document.head.removeChild(customLink);
    };
  }, [fontUrl]);

  return null;
}
