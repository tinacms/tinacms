import * as React from 'react';
import * as ToolbarPrimitive from '@radix-ui/react-toolbar';
import { withCn } from '@udecode/cn';
import { Toolbar } from './toolbar';

type FixedToolbarProps = React.ComponentPropsWithoutRef<
  typeof ToolbarPrimitive.Root
>;

export const FixedToolbar: React.FC<FixedToolbarProps> = withCn(
  Toolbar,
  'p-1 sticky left-0 top-0 z-50 w-full justify-between overflow-x-auto border-b border-border bg-background rounded-t-md'
) as React.FC<FixedToolbarProps>;
