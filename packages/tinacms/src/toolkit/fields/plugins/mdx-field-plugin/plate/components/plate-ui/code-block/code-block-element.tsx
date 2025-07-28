'use client';

import React, { useEffect, useState } from 'react';

import { cn, withRef } from '@udecode/cn';
import {
  formatCodeBlock,
  isLangSupported,
  TCodeBlockElement,
} from '@udecode/plate-code-block';
import { PlateElement } from '@udecode/plate/react';
import { BracesIcon } from 'lucide-react';
import mermaid from 'mermaid';

import {
  CodeLineElement,
  CodeBlockElement as PlateCodeBlockElement,
} from '@tinacms/mdx';
import { Button } from '../button';
import { CodeBlockCombobox } from '../code-block-combobox';
import { MermaidElementWithRef } from '../mermaid-element';
import { ErrorMessage } from './error-message';

export function codeLineToString(content: PlateCodeBlockElement): string {
  return (content.children || [])
    .map((line: CodeLineElement) =>
      (line.children || [])
        .map((textNode: { text: string }) => textNode.text)
        .join('')
    )
    .join('\n');
}

//the default code block element from @udecode/plate-code-block
//custom styling to match TinaCMS branding + remove copy button
export const CodeBlockElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    const { editor, element } = props;

    const [isEditing, setIsEditing] = useState(true);
    const [codeBlockError, setCodeBlockError] = useState<string | null>(null);

    useEffect(() => {
      // Look to find mermaid errors as well as format ( formatCodeBlock(editor, { element })})
      if ((element.lang as string) !== 'mermaid') {
        return;
      }

      if (mermaid.parse(codeLineToString(element as PlateCodeBlockElement))) {
        setCodeBlockError(null); // Clear errors on success
      }
    }, [element.children]);

    mermaid.parseError = (err: any) => {
      setCodeBlockError(
        String(err.message) || 'An error occurred while parsing the diagram.'
      );
    };

    return (
      <PlateElement
        ref={ref}
        className={cn(className, 'py-1 not-tina-prose')}
        {...props}
      >
        <style>{`
          .tina-code-block .hljs-comment,
          .tina-code-block .hljs-code,
          .tina-code-block .hljs-formula { color: #6a737d; }
          .tina-code-block .hljs-keyword,
          .tina-code-block .hljs-doctag,
          .tina-code-block .hljs-template-tag,
          .tina-code-block .hljs-template-variable,
          .tina-code-block .hljs-type,
          .tina-code-block .hljs-variable.language_ { color: #d73a49; }
          .tina-code-block .hljs-title,
          .tina-code-block .hljs-title.class_,
          .tina-code-block .hljs-title.class_.inherited__,
          .tina-code-block .hljs-title.function_ { color: #6f42c1; }
          .tina-code-block .hljs-attr,
          .tina-code-block .hljs-attribute,
          .tina-code-block .hljs-literal,
          .tina-code-block .hljs-meta,
          .tina-code-block .hljs-number,
          .tina-code-block .hljs-operator,
          .tina-code-block .hljs-selector-attr,
          .tina-code-block .hljs-selector-class,
          .tina-code-block .hljs-selector-id,
          .tina-code-block .hljs-variable { color: #005cc5; }
          .tina-code-block .hljs-regexp,
          .tina-code-block .hljs-string,
          .tina-code-block .hljs-meta_.hljs-string { color: #0366d6; }
          .tina-code-block .hljs-built_in,
          .tina-code-block .hljs-symbol { color: #e36209; }
          .tina-code-block .hljs-name,
          .tina-code-block .hljs-quote,
          .tina-code-block .hljs-selector-tag,
          .tina-code-block .hljs-selector-pseudo { color: #22863a; }
          .tina-code-block .hljs-emphasis { font-style: italic; }
          .tina-code-block .hljs-strong { font-weight: bold; }
          .tina-code-block .hljs-section { font-weight: bold; color: #005cc5; }
          .tina-code-block .hljs-bullet { color: #735c0f; }
          .tina-code-block .hljs-addition { background: #f0fff4; color: #22863a; }
          .tina-code-block .hljs-deletion { background: #ffeef0; color: #b31d28; }
          .slate-code_line > span:last-child {margin-right: 1rem;}
        `}</style>
        <div className='relative rounded-md bg-[#F1F5F9] shadow-sm'>
          {isEditing ? (
            <pre
              spellCheck={false}
              className='overflow-x-auto p-4 pt-12 font-mono text-sm leading-[normal] [tab-size:2] print:break-inside-avoid my-2 tina-code-block'
            >
              <code>{children}</code>
              <ErrorMessage error={codeBlockError} />
            </pre>
          ) : (
            <MermaidElementWithRef
              config={codeLineToString(element as PlateCodeBlockElement)}
            />
          )}

          <div className='absolute top-0 py-1 pr-1 rounded-t-md z-10 flex w-full justify-end gap-0.5 select-none border-b border-[#CBD5E1] bg-[#F1F5F9]'>
            {isLangSupported(element.lang as string) && (
              <Button
                tabIndex={-1}
                size='icon'
                variant='ghost'
                className='size-6 text-xs'
                onClick={() => formatCodeBlock(editor, { element })}
                title='Format code'
              >
                <BracesIcon className='!size-3.5 text-muted-foreground' />
              </Button>
            )}
            {(element.lang as string) === 'mermaid' && (
              <Button
                tabIndex={-1}
                size='xs'
                className={cn(
                  'h-6 justify-between gap-1 px-2 text-xs text-muted-foreground select-none',
                  'hover:bg-[#E2E8F0] bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]'
                )}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Preview' : 'Edit'}
              </Button>
            )}
            <CodeBlockCombobox
              onLanguageChange={(lang) => {
                setCodeBlockError(null); // Clear errors on language change
                editor.tf.setNodes<TCodeBlockElement>(
                  { lang },
                  { at: element }
                );
              }}
            />
          </div>
        </div>
      </PlateElement>
    );
  }
);
