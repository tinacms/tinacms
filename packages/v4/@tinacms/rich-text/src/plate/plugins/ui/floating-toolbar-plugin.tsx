'use client';
import { createPlatePlugin } from '@udecode/plate/react';
import React from 'react';
import FloatingToolbarButtons from '../../components/floating-toolbar-buttons';
import { FloatingToolbar } from '../../components/plate-ui/floating-toolbar';

export const FloatingToolbarPlugin = createPlatePlugin({
  key: 'floating-toolbar',
  render: {
    afterEditable: () => (
      <FloatingToolbar>
        <FloatingToolbarButtons />
      </FloatingToolbar>
    ),
  },
});
