import React, { useEffect, useRef, useState } from 'react';
import { ErrorMessage } from './code-block/error-message';

const RENDERER_FAILED = 'The diagram renderer did not load.';

type RenderStatus = 'loading' | 'ready' | 'failed';

export const MermaidElementWithRef = ({ config }) => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<RenderStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const node = mermaidRef.current?.querySelector<HTMLElement>('.mermaid');
    if (!node) return;

    let isCancelled = false;
    setStatus('loading');

    const render = async () => {
      try {
        const { default: mermaid } = await import('mermaid');
        await mermaid.run({ nodes: [node] });

        if (!isCancelled) {
          setError(null);
          setStatus('ready');
        }
      } catch (cause) {
        if (isCancelled) {
          return;
        }
        if (cause instanceof Error) {
          setError(cause.message || RENDERER_FAILED);
        } else {
          setError(RENDERER_FAILED);
        }
        setStatus('failed');
      }
    };

    render();

    return () => {
      isCancelled = true;
    };
  }, [config]);

  return (
    <div contentEditable={false} className='border-border border-b pt-10'>
      <div className='relative'>
        {/* mermaid.run needs this node in the DOM. Hide the <pre>, do not unmount it. */}
        <div
          ref={mermaidRef}
          className={status === 'loading' ? 'opacity-0' : undefined}
        >
          <pre className='mermaid not-tina-prose'>{config}</pre>
        </div>
        {status === 'loading' ? (
          <div className='absolute inset-0 flex items-center justify-center text-sm text-muted-foreground'>
            Loading diagram…
          </div>
        ) : null}
      </div>
      {status === 'failed' ? <ErrorMessage error={error} /> : null}
    </div>
  );
};
