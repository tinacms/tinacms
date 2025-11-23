import * as React from 'react';

export function FontLoader() {
  React.useEffect(() => {
    // Create link element for Google Fonts
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Libre+Baskerville:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // For cleanup
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return null;
}
