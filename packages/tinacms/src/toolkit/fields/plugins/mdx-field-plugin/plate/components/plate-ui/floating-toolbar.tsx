'use client';

import React from 'react';

import { cn, PortalBody, useComposedRef, withRef } from '@udecode/cn';

import {
  type FloatingToolbarState,
  flip,
  offset,
} from '@udecode/plate-floating';

import { Toolbar } from './toolbar';
import { useEditorRef, useEventEditorValue } from '@udecode/plate/react';
import { useCustomFloatingToolbarState } from './use-floating-toolbar-state';
import { useCustomFloatingToolbar } from './use-floating-toolbar-hook';

export const FloatingToolbar = withRef<
  typeof Toolbar,
  {
    state?: FloatingToolbarState;
  }
>(({ children, state, ...props }, propRef) => {
  const editorId = useEditorRef();
  const focusedEditorId = useEventEditorValue('focus');

  const test = useCustomFloatingToolbarState({
    editorId: editorId.id,
    focusedEditorId,
    ...state,
    floatingOptions: {
      middleware: [
        offset(12),
        flip({
          fallbackPlacements: [
            'top-start',
            'top-end',
            'bottom-start',
            'bottom-end',
          ],
          padding: 12,
        }),
      ],
      placement: 'top',
      ...state?.floatingOptions,
    },
  });

  const {
    hidden,
    props: rootProps,
    ref: floatingRef,
  } = useCustomFloatingToolbar(test);

  const ref = useComposedRef<HTMLDivElement>(propRef, floatingRef);

  if (hidden) return null;

  return (
    <PortalBody>
      <Toolbar
        className={cn(
          'absolute z-[999999] whitespace-nowrap border bg-popover px-1 opacity-100 shadow-md print:hidden rounded-md'
        )}
        {...props}
        {...rootProps}
        ref={ref}
      >
        {children}
      </Toolbar>
    </PortalBody>
  );
});
