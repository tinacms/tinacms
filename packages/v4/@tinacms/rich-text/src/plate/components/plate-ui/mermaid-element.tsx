import mermaid from 'mermaid';
import React, { useEffect, useRef } from 'react';

export const MermaidElementWithRef = ({ config }) => {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = mermaidRef.current?.querySelector<HTMLElement>('.mermaid');
    if (!node) return;

    // mermaid.run rejects for a diagram it cannot parse, and the author types one
    // character at a time, so most intermediate states do not parse. Reporting that is
    // the code block's job — code-block-element.tsx validates and shows the message.
    // Here the rejection only has to stop being an unhandled one.
    mermaid.run({ nodes: [node] }).catch(() => {});
  }, [config]);

  return (
    <div contentEditable={false} className='border-border border-b pt-10'>
      <div ref={mermaidRef}>
        <pre className='mermaid not-tina-prose'>{config}</pre>
      </div>
    </div>
  );
};
