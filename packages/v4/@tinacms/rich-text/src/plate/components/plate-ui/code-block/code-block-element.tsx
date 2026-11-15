'use client';

import React, { useEffect, useState } from 'react';

import { cn, withRef } from '@udecode/cn';
import {
  TCodeBlockElement,
  formatCodeBlock,
  isLangSupported,
} from '@udecode/plate-code-block';
import { PlateElement } from '@udecode/plate/react';
import { BracesIcon } from 'lucide-react';

import type {
  CodeLineElement,
  CodeBlockElement as PlateCodeBlockElement,
} from '../../../types';
import { Button } from '../button';
import { CodeBlockCombobox } from '../code-block-combobox';
import { MermaidElementWithRef } from '../mermaid-element';
import { ErrorMessage } from './error-message';

const PARSE_FAILED = 'An error occurred while parsing the diagram.';

export function codeLineToString(content: PlateCodeBlockElement): string {
  return (content.children || [])
    .map((line: CodeLineElement) =>
      (line.children || [])
        .map((textNode: { text: string }) => textNode.text)
        .join('')
    )
    .join('\n');
}

export const CodeBlockElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    const { editor, element } = props;

    const [isEditing, setIsEditing] = useState(true);
    const [codeBlockError, setCodeBlockError] = useState<string | null>(null);

    useEffect(() => {
      if ((element.lang as string) !== 'mermaid') {
        return;
      }

      let isCancelled = false;

      const validateMermaid = async () => {
        try {
          const { default: mermaid } = await import('mermaid');
          await mermaid.parse(
            codeLineToString(element as PlateCodeBlockElement)
          );

          if (!isCancelled) {
            setCodeBlockError(null);
          }
        } catch (cause) {
          if (isCancelled) {
            return;
          }
          if (cause instanceof Error) {
            setCodeBlockError(cause.message || PARSE_FAILED);
          } else {
            setCodeBlockError(PARSE_FAILED);
          }
        }
      };

      validateMermaid();

      return () => {
        isCancelled = true;
      };
    }, [element.children, element.lang]);

    return (
      <PlateElement
        ref={ref}
        className={cn(className, 'not-tina-prose mb-3 last:mb-0')}
        {...props}
      >
        <style>{`
          .tina-code-block { color: #3b2f26; }
          .tina-code-block .hljs-comment,
          .tina-code-block .hljs-code,
          .tina-code-block .hljs-formula { color: #8c7b6b; }
          .tina-code-block .hljs-keyword,
          .tina-code-block .hljs-doctag,
          .tina-code-block .hljs-template-tag,
          .tina-code-block .hljs-template-variable,
          .tina-code-block .hljs-type,
          .tina-code-block .hljs-variable.language_ { color: #b4322a; }
          .tina-code-block .hljs-title,
          .tina-code-block .hljs-title.class_,
          .tina-code-block .hljs-title.class_.inherited__,
          .tina-code-block .hljs-title.function_ { color: #9a4a0f; }
          .tina-code-block .hljs-attr,
          .tina-code-block .hljs-attribute,
          .tina-code-block .hljs-literal,
          .tina-code-block .hljs-meta,
          .tina-code-block .hljs-number,
          .tina-code-block .hljs-operator,
          .tina-code-block .hljs-selector-attr,
          .tina-code-block .hljs-selector-class,
          .tina-code-block .hljs-selector-id,
          .tina-code-block .hljs-variable { color: #a05a00; }
          .tina-code-block .hljs-regexp,
          .tina-code-block .hljs-string,
          .tina-code-block .hljs-meta_.hljs-string { color: #3d7a3a; }
          .tina-code-block .hljs-built_in,
          .tina-code-block .hljs-symbol { color: #c2410c; }
          .tina-code-block .hljs-name,
          .tina-code-block .hljs-quote,
          .tina-code-block .hljs-selector-tag,
          .tina-code-block .hljs-selector-pseudo { color: #2f6b4f; }
          .tina-code-block .hljs-emphasis { font-style: italic; }
          .tina-code-block .hljs-strong { font-weight: bold; }
          .tina-code-block .hljs-section { font-weight: bold; color: #a05a00; }
          .tina-code-block .hljs-bullet { color: #735c0f; }
          .tina-code-block .hljs-addition { background: #eef7e8; color: #3d7a3a; }
          .tina-code-block .hljs-deletion { background: #fdecea; color: #b4322a; }
          .slate-code_line > span:last-child {margin-right: 1rem;}
        `}</style>
        <div className='overflow-hidden rounded-md border border-border bg-[#fbf7f2]'>
          <div
            contentEditable={false}
            className='flex min-h-9 items-center justify-between gap-2 border-b border-border bg-[#f5efe7] px-1.5 py-1 select-none'
          >
            <CodeBlockCombobox
              onLanguageChange={(lang) => {
                setCodeBlockError(null);
                editor.tf.setNodes<TCodeBlockElement>(
                  { lang },
                  { at: element }
                );
              }}
            />
            <div className='flex items-center gap-1'>
              {(element.lang as string) === 'mermaid' && (
                <div
                  role='group'
                  aria-label='Diagram view'
                  className='flex rounded-sm bg-muted p-0.5'
                >
                  {([true, false] as const).map((editing) => (
                    <Button
                      key={editing ? 'edit' : 'preview'}
                      tabIndex={-1}
                      size='none'
                      variant='ghost'
                      aria-pressed={isEditing === editing}
                      className={cn(
                        'h-6 rounded-xs px-2 text-xs text-muted-foreground',
                        isEditing === editing &&
                          'bg-card text-foreground shadow-xs'
                      )}
                      onClick={() => setIsEditing(editing)}
                    >
                      {editing ? 'Edit' : 'Preview'}
                    </Button>
                  ))}
                </div>
              )}
              {isLangSupported(element.lang as string) && (
                <Button
                  tabIndex={-1}
                  size='none'
                  variant='ghost'
                  className='h-6 gap-1 px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground'
                  onClick={() => formatCodeBlock(editor, { element })}
                >
                  <BracesIcon aria-hidden className='size-3.5' />
                  Format code
                </Button>
              )}
            </div>
          </div>
          {isEditing ? (
            <pre
              spellCheck={false}
              className='tina-code-block m-0 overflow-x-auto p-3 font-mono text-sm leading-6 [tab-size:2] print:break-inside-avoid'
            >
              <code>{children}</code>
              <ErrorMessage error={codeBlockError} />
            </pre>
          ) : (
            <MermaidElementWithRef
              config={codeLineToString(element as PlateCodeBlockElement)}
            />
          )}
        </div>
      </PlateElement>
    );
  }
);
