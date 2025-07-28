'use client';

import * as React from 'react';

import type { TLinkElement } from '@udecode/plate-link';
import type { PlateElementProps } from '@udecode/plate/react';

import { useLink } from '@udecode/plate-link/react';
import { PlateElement, useEditorRef } from '@udecode/plate/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';

export function LinkElement(props: PlateElementProps<TLinkElement>) {
  const { props: linkProps } = useLink({ element: props.element });
  const editor = useEditorRef();

  const isInCodeBlock = editor?.api.above({
    match: { type: editor.getType(CodeBlockPlugin) },
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
