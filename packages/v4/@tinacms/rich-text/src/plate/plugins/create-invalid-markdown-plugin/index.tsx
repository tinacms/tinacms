import { PlateElementProps, createPlatePlugin } from '@udecode/plate/react';
import { AlertTriangle } from 'lucide-react';
import React from 'react';
import {
  INVALID_MARKDOWN_TYPE,
  buildErrorMessage,
} from '../../../error-message';

export const ELEMENT_INVALID_MARKDOWN = INVALID_MARKDOWN_TYPE;

export const createInvalidMarkdownPlugin = createPlatePlugin({
  key: ELEMENT_INVALID_MARKDOWN,
  // Plate reads the behaviour of a node from `node`. Under `options` it takes
  // the shape without complaint, registers no element, and the component below
  // never mounts.
  node: {
    isElement: true,
    isVoid: true,
    isInline: false,
    component: InvalidMarkdownElement,
  },
});

function InvalidMarkdownElement({
  attributes,
  element,
  children,
}: PlateElementProps) {
  return (
    <div {...attributes}>
      <ErrorMessage error={element} />
      {children}
    </div>
  );
}

function ErrorMessage({ error }) {
  const message = buildErrorMessage(error);
  return (
    <div
      role='alert'
      contentEditable={false}
      className='mb-3 flex items-start gap-3 rounded-sm border border-status-failed-border bg-status-failed-subtle p-3 text-status-failed last:mb-0'
    >
      <AlertTriangle aria-hidden className='mt-0.5 size-4 shrink-0' />
      <div className='min-w-0 space-y-2 text-sm'>
        <h3 className='m-0 text-base font-semibold'>Error parsing markdown</h3>
        <p className='m-0'>{message}</p>
        <p className='m-0'>
          To fix this, edit the file directly. Your original markdown is kept
          as-is until it parses.
        </p>
      </div>
    </div>
  );
}
