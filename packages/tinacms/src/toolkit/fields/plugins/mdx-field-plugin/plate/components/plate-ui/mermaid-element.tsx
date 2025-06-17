import { withRef } from '@udecode/cn';
import { PlateElement } from '@udecode/plate-common';
import { Eye, SquarePen } from 'lucide-react';
import mermaid from 'mermaid';
import React, { useEffect, useRef, useState } from 'react';
import { ELEMENT_MERMAID } from '../../plugins/custom/mermaid-plugin';
import { CodeBlock } from '../../plugins/ui/code-block';

const MermaidElementWithRef = ({ config }) => {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mermaidRef.current) {
      mermaid.initialize({ startOnLoad: true });
      mermaid.init();
    }
  }, [config]);

  return (
    <div contentEditable={false} className='border-border border-b'>
      <div ref={mermaidRef}>
        <pre className='mermaid not-tina-prose'>{config}</pre>
      </div>
    </div>
  );
};

const Bubble = ({ children }) => {
  return (
    <div className='bg-blue-600 rounded p-2 transition-transform duration-200 ease-in-out hover:scale-110'>
      {children}
    </div>
  );
};

const ErrorMsg = ({ error }) => {
  if (error) {
    return (
      <div
        contentEditable={false}
        className='font-mono bg-red-600 text-white p-2 rounded cursor-default'
      >
        {error}
      </div>
    );
  }
  return null;
};

const DEFAULT_MERMAID_CONFIG = `%% This won't render without implementing a rendering engine (e.g. mermaid on npm)
flowchart TD
    id1(this is an example flow diagram) 
    --> id2(modify me to see changes!)
    id2 
    --> id3(Click the top button to preview the changes)
    --> id4(Learn about mermaid diagrams - mermaid.js.org)`;

export const MermaidElement = withRef<typeof PlateElement>(
  ({ children, nodeProps, element, ...props }, ref) => {
    const [mermaidConfig, setMermaidConfig] = useState(
      element.value || DEFAULT_MERMAID_CONFIG
    );
    const [isEditing, setIsEditing] = useState(
      mermaidConfig === DEFAULT_MERMAID_CONFIG || false
    );

    const [mermaidError, setMermaidError] = useState<string | null>(null);

    const node = {
      type: ELEMENT_MERMAID,
      value: mermaidConfig,
      children: [{ type: 'text', text: '' }],
    };

    useEffect(() => {
      if (mermaid.parse(mermaidConfig as string)) {
        setMermaidError(null); // Clear errors on success
      }
    }, [mermaidConfig]);

    mermaid.parseError = (err: any) => {
      setMermaidError(
        String(err.message) || 'An error occurred while parsing the diagram.'
      );
    };

    return (
      <PlateElement element={element} ref={ref} {...props}>
        <div className='relative group'>
          <div className='absolute top-2 right-2 z-10 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out'>
            <Bubble>
              {isEditing ? (
                <Eye
                  className='w-5 h-5 fill-white cursor-pointer'
                  onClick={() => {
                    setIsEditing(!isEditing);
                  }}
                />
              ) : (
                <SquarePen
                  className='w-5 h-5 fill-white cursor-pointer'
                  onClick={() => {
                    setIsEditing(!isEditing);
                  }}
                />
              )}
            </Bubble>
          </div>

          {isEditing ? (
            <CodeBlock
              children={''}
              language='yaml'
              {...props}
              element={node}
              defaultValue={mermaidConfig}
              onChangeCallback={(value) => setMermaidConfig(value)}
            />
          ) : (
            <MermaidElementWithRef config={mermaidConfig} />
          )}
        </div>
        {children}
        <ErrorMsg error={mermaidError} />
      </PlateElement>
    );
  }
);
