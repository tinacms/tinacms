import { toFieldAddress, useActiveField } from '@tinacms/tinacms/react';
import { useEffect } from 'react';
import { isActivateMessage } from './preview/bridge';

// Parent half of click-to-edit: a preview click message carries the field address
// and nothing else (ADR-009 §4). Setting it active is all this does — focus is
// field-owned via useFieldActivation, reveal (expand/scroll) is a later increment.
export function ActiveFieldListener() {
  const { setActive } = useActiveField();
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.origin) return;
      if (isActivateMessage(event.data)) {
        setActive(toFieldAddress(event.data.address));
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [setActive]);
  return null;
}
