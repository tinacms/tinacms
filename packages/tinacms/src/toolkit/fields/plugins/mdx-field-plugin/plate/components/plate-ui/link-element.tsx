'use client';

import * as React from 'react';

import type { PlateElementProps } from 'platejs/react';

import { getLinkAttributes } from '@platejs/link';
import { PlateElement, useEditorRef } from 'platejs/react';
import { BaseCodeBlockPlugin } from '@platejs/code-block';

// Type stub for link element
type TLinkElement = { type: string; url: string; children: any[] };

export function LinkElement(props: PlateElementProps<TLinkElement>) {
  const editor = useEditorRef();
  const linkProps = getLinkAttributes(editor, props.element);

  const isInCodeBlock = editor?.api.above({
    match: { type: BaseCodeBlockPlugin.key },
  });

  if (isInCodeBlock) {
    return (
      <code
        {...props.attributes}
        className='rounded-md bg-muted px-[0.3em] py-[0.2em] font-mono text-sm whitespace-pre-wrap'
      >
        {props.children}
      </code>
    );
  }

  return (
    <PlateElement
      {...props}
      as='a'
      className='font-small underline underline-offset-2 text-blue-500 hover:text-blue-600 transition-color ease-out duration-150'
      attributes={{
        ...props.attributes,
        ...(linkProps as any),
      }}
    >
      {props.children}
    </PlateElement>
  );
}
