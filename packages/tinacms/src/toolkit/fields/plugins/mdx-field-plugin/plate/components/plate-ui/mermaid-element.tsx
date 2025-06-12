import mermaid from 'mermaid';
import React, { useEffect, useRef } from 'react';

export const MermaidElementWithRef = ({ config }) => {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mermaidRef.current) {
      mermaid.initialize({ startOnLoad: true });
      mermaid.init();
    }
  }, [config]);

  return (
    <div contentEditable={false} className='border-border border-b pt-10'>
      <div ref={mermaidRef}>
        <pre className='mermaid not-tina-prose'>{config}</pre>
      </div>
    </div>
  );
};
