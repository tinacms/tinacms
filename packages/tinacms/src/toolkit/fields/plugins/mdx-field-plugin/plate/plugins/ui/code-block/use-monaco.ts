// hooks/useCustomMonaco.ts
import { useState, useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';

export function useCustomMonaco() {
  const [monacoInstance, setMonacoInstance] = useState<typeof monaco | null>(
    null
  );
  const mountedRef = useRef(true);
  const loaderRef = useRef<any>(null);

  useEffect(() => {
    const instance = loader.__getMonacoInstance();

    if (instance) {
      setMonacoInstance(instance);
      return;
    }

    if (!loaderRef.current) {
      loader.config({
        'vs/nls': { availableLanguages: {} },
      });

      try {
        loaderRef.current = loader.init();

        loaderRef.current
          .then((monacoApi: typeof monaco) => {
            if (mountedRef.current) {
              setMonacoInstance(monacoApi);
            }
          })
          .catch((error: any) => {
            if (mountedRef.current && error.type !== 'cancelation') {
              console.error('Monaco initialization error:', error);
            }
          });
      } catch (err) {
        console.error('Failed to initialize Monaco:', err);
      }
    }

    return () => {
      mountedRef.current = false;
    };
  }, []);

  return monacoInstance;
}

export default useCustomMonaco;
