import { PlateElementProps, createPlatePlugin } from '@udecode/plate/react';
import React from 'react';
import {
  INVALID_MARKDOWN_TYPE,
  buildErrorMessage,
} from '../../../error-message';

export const ELEMENT_INVALID_MARKDOWN = INVALID_MARKDOWN_TYPE;

export const createInvalidMarkdownPlugin = createPlatePlugin({
  key: ELEMENT_INVALID_MARKDOWN,
  options: {
    isElement: true,
    isVoid: true,
    isInline: false,
  },
  node: {
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

// v3 offered a "switch to raw-mode" button here. v4 has no raw editor to switch
// to, so it would have done nothing — the recovery instruction points at the
// file instead. Saving is safe meanwhile: the serializer writes this node's
// original source back rather than a blank body.
function ErrorMessage({ error }) {
  const message = buildErrorMessage(error);
  return (
    <div contentEditable={false} className='bg-red-50 sm:rounded-lg'>
      <div className='px-4 py-5 sm:p-6'>
        <h3 className='text-lg leading-6 font-medium text-red-800'>
          ❌ Error parsing markdown
        </h3>
        <div className='mt-2 max-w-xl text-sm text-red-800 space-y-4'>
          <p>{message}</p>
          <p>
            To fix this, edit the file directly. Your original markdown is kept
            as-is until it parses.
          </p>
        </div>
      </div>
    </div>
  );
}
