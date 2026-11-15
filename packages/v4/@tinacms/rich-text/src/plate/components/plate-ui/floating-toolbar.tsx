'use client';

import React from 'react';

import { PortalBody, cn, useComposedRef, withRef } from '@udecode/cn';

import {
  type FloatingToolbarState,
  flip,
  offset,
} from '@udecode/plate-floating';

import { TablePlugin } from '@udecode/plate-table/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import {
  useEditorRef,
  useEditorSelector,
  useEventEditorValue,
} from '@udecode/plate/react';
import { helpers } from '../../plugins/core/common';
import { useToolbarContext } from '../../toolbar/toolbar-provider';
import { Toolbar } from './toolbar';
import { useCustomFloatingToolbar } from './use-floating-toolbar-hook';
import { useCustomFloatingToolbarState } from './use-floating-toolbar-state';

export const FloatingToolbar = withRef<
  typeof Toolbar,
  {
    state?: FloatingToolbarState;
  }
>(({ children, state, ...props }, propRef) => {
  const editorId = useEditorRef();
  const focusedEditorId = useEventEditorValue('focus');
  const { overrides } = useToolbarContext();
  const inTable = useEditorSelector(
    (e) =>
      helpers.isNodeActive(e, TablePlugin) ||
      (e.selection !== null &&
        [e.selection.anchor, e.selection.focus].some((at) =>
          e.api.above({ at, match: { type: e.getType(TablePlugin) } })
        )),
    []
  );
  const inLink = useEditorSelector(
    (e) =>
      e.selection !== null &&
      !!e.api.above({ match: { type: e.getType(LinkPlugin) } }),
    []
  );
  const floatingState = useCustomFloatingToolbarState({
    editorId: editorId.id,
    focusedEditorId,
    hideToolbar:
      state?.hideToolbar ||
      inTable ||
      inLink ||
      overrides?.showFloatingToolbar === false,
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
  } = useCustomFloatingToolbar(floatingState);

  const ref = useComposedRef<HTMLDivElement>(propRef, floatingRef);

  if (hidden) return null;

  return (
    <PortalBody>
      <Toolbar
        aria-label='Turn into'
        className={cn(
          'absolute z-20 whitespace-nowrap rounded-md bg-popover p-1 font-sans shadow-popover inset-ring inset-ring-border print:hidden'
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
